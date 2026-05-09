<div align="center">

# 🛡️ Codwolf MailShield

**ML-powered email spam detection with a modern Glassmorphism UI**

[![Python](https://img.shields.io/badge/Python-3.8%2B-FFD43B?style=flat-square&logo=python&logoColor=black)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![NLTK](https://img.shields.io/badge/NLTK-NLP-4ECDC4?style=flat-square)](https://www.nltk.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Analytics-FF9F43?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat-square)](LICENSE)

[Features](#-features) · [Project Structure](#-project-structure) · [Quick Start](#-quick-start) · [License](#-license)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔍 | **Real-Time Detection** | Classifies email content as Spam or Safe instantly |
| 📊 | **Confidence Scoring** | Animated probability meter showing prediction strength |
| 🚩 | **Keyword Flagging** | Highlights suspicious spam-trigger words automatically |
| 📁 | **File Upload** | Drag & drop `.txt` files directly into the scanner |
| 📈 | **Analytics Dashboard** | Spam vs. Safe charts and 7-day activity visualization |
| 🗂️ | **Scan History** | Local log of all past scans with CSV export |
| 💎 | **Glassmorphism UI** | Sleek frosted-glass design with a single-page experience |

---

## 📁 Project Structure

```
EMAIL_SPAM/
├── static/
│   ├── script.js          # Frontend logic, charts, scan history
│   └── style.css          # Glassmorphism UI & responsive styles
│
├── templates/
│   ├── index.html         # Main SPA — Scanner & Analytics
│   └── admin.html         # Admin panel
│
├── app.py                 # Flask app & prediction endpoint
├── model_training.py      # ML training script
├── sms.tsv                # Spam/ham training dataset
├── spam_model.pkl         # Trained classifier
├── vectorizer.pkl         # TF-IDF vectorizer
├── requirements.txt       # Python dependencies
└── LICENSE
```

---

## 🚀 Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/codraja06/email-spam-detection.git
cd email-spam-detection
```

**2. Create a virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Train the model** *(first run only)*
```bash
python model_training.py
```

**5. Run the app**
```bash
python app.py
```

**6. Open in browser**
```
http://127.0.0.1:5000/
```

---

## 📄 License

Distributed under the terms of the [LICENSE](LICENSE) file.

---

<div align="center">

Built for **[Codwolf](https://github.com/codraja06)** &nbsp;·&nbsp; [⬆ Back to Top](#%EF%B8%8F-codwolf-mailshield)

</div>
