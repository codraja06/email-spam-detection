document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            // If on admin page, update charts
            if (window.location.pathname === '/admin') {
                initCharts();
            }
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    // --- Main Scanner Page Logic ---
    if (window.location.pathname === '/') {
        const subjectInput = document.getElementById('email-subject');
        const contentInput = document.getElementById('email-content');
        const analyzeBtn = document.getElementById('analyze-btn');
        const clearBtn = document.getElementById('clear-btn');
        const sampleBtn = document.getElementById('sample-btn');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        // Results elements
        const resultCard = document.getElementById('result-card');
        const predictionBadge = document.getElementById('prediction-badge');
        const probabilityFill = document.getElementById('probability-fill');
        const confidenceText = document.getElementById('confidence-text');
        const keywordsContainer = document.getElementById('keywords-container');
        const keywordsList = document.getElementById('keywords-list');
        
        // Drag and Drop
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                readFile(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                readFile(e.target.files[0]);
            }
        });

        function readFile(file) {
            if (!file.name.endsWith('.txt')) {
                alert('Please upload a .txt file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                contentInput.value = e.target.result;
            };
            reader.readAsText(file);
        }

        // Analyze logic
        analyzeBtn.addEventListener('click', async () => {
            const subject = subjectInput.value.trim();
            const content = contentInput.value.trim();
            
            if (!subject && !content) {
                alert("Please enter some text to analyze.");
                return;
            }

            loadingOverlay.classList.remove('hidden');
            resultCard.classList.add('hidden');

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, content })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Server error');
                }

                displayResults(data, subject || 'No Subject');
                saveToHistory(subject || 'No Subject', data.prediction, data.confidence);
                loadHistory(); // refresh table
                updateStats(data.prediction); // update global stats for admin
                
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        });

        function displayResults(data, subject) {
            resultCard.classList.remove('hidden');
            
            // Badge
            if (data.prediction === 'Spam') {
                predictionBadge.className = 'badge badge-spam';
                predictionBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Spam Detected';
                probabilityFill.style.backgroundColor = 'var(--danger-color)';
            } else {
                predictionBadge.className = 'badge badge-safe';
                predictionBadge.innerHTML = '<i class="fa-solid fa-shield-check"></i> Safe Email';
                probabilityFill.style.backgroundColor = 'var(--success-color)';
            }
            
            // Meter
            // Add a slight delay for smooth animation
            setTimeout(() => {
                probabilityFill.style.width = `${data.spam_probability}%`;
            }, 100);
            confidenceText.textContent = `Confidence: ${data.confidence}% (Spam Probability: ${data.spam_probability}%)`;

            // Keywords
            if (data.suspicious_words && data.suspicious_words.length > 0) {
                keywordsContainer.classList.remove('hidden');
                keywordsList.innerHTML = '';
                // Remove duplicates
                const uniqueWords = [...new Set(data.suspicious_words)];
                uniqueWords.forEach(word => {
                    const span = document.createElement('span');
                    span.className = 'keyword-tag';
                    span.textContent = word;
                    keywordsList.appendChild(span);
                });
            } else {
                keywordsContainer.classList.add('hidden');
            }
        }

        // Clear
        clearBtn.addEventListener('click', () => {
            subjectInput.value = '';
            contentInput.value = '';
            resultCard.classList.add('hidden');
            probabilityFill.style.width = '0%';
        });

        // Sample Data
        const samples = [
            { s: "URGENT: Claim your $1000 Walmart Gift Card Now!", c: "Congratulations! You have been selected to receive a free $1000 gift card. Click the link below to claim your prize. Limited time offer!" },
            { s: "Meeting Agenda for Tomorrow", c: "Hi team, please find attached the agenda for our sync tomorrow at 10 AM. Let me know if you have any items to add." },
            { s: "Lose weight fast with our new pill!", c: "Buy cheap viagra and weight loss pills today. 100% guaranteed results or your money back. Visit our online pharmacy." }
        ];

        sampleBtn.addEventListener('click', () => {
            const randomSample = samples[Math.floor(Math.random() * samples.length)];
            subjectInput.value = randomSample.s;
            contentInput.value = randomSample.c;
            resultCard.classList.add('hidden');
        });

        // History Export
        document.getElementById('export-btn').addEventListener('click', () => {
            const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
            if (history.length === 0) {
                alert("No history to export.");
                return;
            }
            
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Subject,Result,Confidence\n";
            
            history.forEach(row => {
                // Escape commas and quotes in subject
                const safeSubject = `"${row.subject.replace(/"/g, '""')}"`;
                csvContent += `${row.date},${safeSubject},${row.prediction},${row.confidence}%\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "spam_scan_history.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Clear History
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all scan history and analytics data? This action cannot be undone.')) {
                localStorage.removeItem('scanHistory');
                localStorage.removeItem('scanStats');
                loadHistory();
                if (window.initCharts) window.initCharts();
            }
        });

        // Initialize history table
        loadHistory();
    }

    // --- History & Stats Management (Shared via LocalStorage) ---
    function saveToHistory(subject, prediction, confidence) {
        let history = JSON.parse(localStorage.getItem('scanHistory')) || [];
        const date = new Date().toLocaleString();
        
        // Add to beginning
        history.unshift({ date, subject, prediction, confidence });
        
        // Keep only last 10
        if (history.length > 10) history.pop();
        
        localStorage.setItem('scanHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const historyBody = document.getElementById('history-body');
        if (!historyBody) return;
        
        const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
        
        if (history.length === 0) {
            historyBody.innerHTML = '<tr class="empty-row"><td colspan="3">No recent scans.</td></tr>';
            return;
        }
        
        historyBody.innerHTML = '';
        history.forEach(item => {
            const tr = document.createElement('tr');
            const resultClass = item.prediction === 'Spam' ? 'spam-text' : 'safe-text';
            const shortSubject = item.subject.length > 30 ? item.subject.substring(0, 30) + '...' : item.subject;
            
            tr.innerHTML = `
                <td><div style="font-size: 0.8rem; color: var(--text-muted);">${item.date}</div>${shortSubject}</td>
                <td class="${resultClass}">${item.prediction}</td>
                <td>${item.confidence}%</td>
            `;
            historyBody.appendChild(tr);
        });
    }

    function updateStats(prediction) {
        let stats = JSON.parse(localStorage.getItem('scanStats')) || { total: 0, spam: 0, safe: 0, dates: {} };
        if (!stats.dates) stats.dates = {};
        
        stats.total++;
        if (prediction === 'Spam') stats.spam++;
        else stats.safe++;
        
        // Track daily activity
        const today = new Date().toLocaleDateString();
        if (!stats.dates[today]) stats.dates[today] = { spam: 0, safe: 0 };
        
        if (prediction === 'Spam') stats.dates[today].spam++;
        else stats.dates[today].safe++;
        
        localStorage.setItem('scanStats', JSON.stringify(stats));
    }

    // --- Admin Page Logic ---
    window.initCharts = initCharts; // Make globally accessible for the tab toggle
    
    // Call once to initialize charts if Elements are present
    setTimeout(initCharts, 100);

    function initCharts() {
        const stats = JSON.parse(localStorage.getItem('scanStats')) || { total: 0, spam: 0, safe: 0, dates: {} };
        if (!stats.dates) stats.dates = {};
        
        // Update Counter Cards
        document.getElementById('total-scans-count').textContent = stats.total;
        document.getElementById('spam-count').textContent = stats.spam;
        document.getElementById('safe-count').textContent = stats.safe;

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // 1. Ratio Chart (Pie)
        const ratioCtx = document.getElementById('ratioChart');
        if (ratioCtx) {
            // Destroy existing chart if it exists (for theme toggling)
            const existingChart = Chart.getChart('ratioChart');
            if (existingChart) existingChart.destroy();

            new Chart(ratioCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Spam', 'Safe'],
                    datasets: [{
                        data: [stats.spam, stats.safe],
                        backgroundColor: ['#dc2626', '#16a34a'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { labels: { color: textColor } }
                    }
                }
            });
        }

        // 2. Activity Chart (Bar)
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx) {
            const existingChart = Chart.getChart('activityChart');
            if (existingChart) existingChart.destroy();

            // Prepare last 7 days data
            const labels = [];
            const spamData = [];
            const safeData = [];
            
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString();
                
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
                
                if (stats.dates[dateStr]) {
                    spamData.push(stats.dates[dateStr].spam);
                    safeData.push(stats.dates[dateStr].safe);
                } else {
                    spamData.push(0);
                    safeData.push(0);
                }
            }

            new Chart(activityCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Safe',
                            data: safeData,
                            backgroundColor: '#16a34a',
                        },
                        {
                            label: 'Spam',
                            data: spamData,
                            backgroundColor: '#dc2626',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
                    },
                    plugins: {
                        legend: { labels: { color: textColor } }
                    }
                }
            });
        }
    }
});
