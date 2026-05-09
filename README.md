# Codwolf MailShield 🛡️

Codwolf MailShield is an advanced Machine Learning-powered Spam Detection web application. It analyzes email subjects and content to accurately classify them as "Safe" or "Spam" in real-time. It features a beautifully designed, responsive single-page Glassmorphism UI and a built-in analytics dashboard.

## 🌟 Key Features

- **Real-Time Spam Detection:** Instantly analyze email text using a pre-trained ML classification model.
- **Confidence Scoring:** View detailed probability meters indicating the exact confidence of the prediction.
- **Suspicious Keyword Flagging:** Automatically extracts and highlights potential spam trigger words.
- **Single Page Application (SPA):** Seamlessly switch between the Scanner and Analytics dashboard without page reloads.
- **File Upload Support:** Drag and drop `.txt` files directly into the scanner for quick analysis.
- **Local History & CSV Export:** Keeps a local record of recent scans and allows exporting them as a CSV file.
- **Analytics Dashboard:** Visualizes your scan history using interactive Chart.js graphs (Spam vs. Safe ratios, 7-day activity).
- **Glassmorphism Theme:** A sleek, modern, professional UI featuring frosted glass panels, deep corporate colors, and dynamic background gradients.

## 🛠️ Technology Stack

- **Backend:** Python, Flask
- **Machine Learning:** Scikit-Learn, Pandas, NLTK (Models serialized via Pickle)
- **Frontend:** HTML5, Vanilla JavaScript, CSS3 (Custom Glassmorphism UI)
- **Data Visualization:** Chart.js

## 🧠 How It Works (The Core Process)

1. **Model Training (`model_training.py`):** The application relies on a machine learning model trained on a dataset of spam and ham (safe) messages (`sms.tsv`). The raw text data is cleaned, tokenized, and converted into numerical features using a text vectorizer (`vectorizer.pkl`), which is then used to train the classification model (`spam_model.pkl`).
2. **User Input (`index.html`):** The user provides email subjects and content via the web interface. This can be done by typing, pasting, or dropping a text file.
3. **API Processing (`app.py`):** The frontend JavaScript sends an asynchronous JSON request to the Flask backend's `/predict` endpoint.
4. **Prediction Engine:** The backend server preprocesses the incoming text, transforms it using the loaded vectorizer, and passes it to the ML model. The model calculates the probability of the text being spam, while a keyword scanner flags known suspicious words.
5. **Response & Visualization (`script.js`):** The backend returns the classification, confidence score, and flagged keywords. The frontend dynamically updates the UI, displaying the result badge, animating the probability meter, saving the history, and updating the global analytics data.

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package installer)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/codwolf-mailshield.git
   cd codwolf-mailshield
   ```

2. **Create a Virtual Environment (Optional but recommended):**
   ```bash
   python -m venv venv
   # On Windows use: venv\Scripts\activate
   # On Mac/Linux use: source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application:**
   ```bash
   python app.py
   ```

5. **Access the Web App:**
   Open your browser and navigate to `http://127.0.0.1:5000/`

---

*Designed for Codwolf.*
