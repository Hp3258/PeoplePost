# PeoplePost - Civic Issue Reporting Platform

A modern web application that empowers citizens to report civic issues and enables government officials to manage and resolve them efficiently. Features AI-powered department routing using machine learning.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## ✨ Features

### For Citizens
- 📍 **GPS-based Reporting** - Capture exact location of issues
- 📸 **Photo Upload** - Attach up to 5 images per report
- 🤖 **AI Department Routing** - ML model predicts correct department
- 📊 **Track Progress** - Monitor status of your reports
- 🔔 **Status Updates** - Get notified when issues are resolved

### For Officials
- 📋 **Dashboard** - Manage all reported issues
- 🗺️ **Map View** - Visualize issues geographically
- 🔍 **Filtering** - Filter by status, date, and category
- ✅ **Status Management** - Update issue status
- 📷 **Resolution Proof** - Upload proof of resolution

### Technical Features
- 🎨 **Modern UI/UX** - Gradient backgrounds, glassmorphism, smooth animations
- 🔐 **Secure Authentication** - Supabase Auth with role-based access
- 🌐 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **Fast Performance** - Optimized with Next.js 16
- 🤖 **ML Integration** - Department prediction using SBERT + Logistic Regression

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet + React Leaflet
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **ML API**: FastAPI (Python)

### ML Model
- **Framework**: Scikit-learn
- **Embeddings**: Sentence Transformers (SBERT)
- **Model**: Logistic Regression Classifier
- **Departments**: Roads, Streetlight, Water & Drainage, Waste Management, Animal Control

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Git

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/yourusername/peoplepost.git
cd peoplepost
\`\`\`

### 2. Install Dependencies

**Frontend:**
\`\`\`bash
npm install
\`\`\`

**ML API (Optional):**
\`\`\`bash
cd ml-api
pip install -r requirements.txt
cd ..
\`\`\`

### 3. Environment Setup

Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
\`\`\`



### 5. Run Development Servers

**Terminal 1 - Next.js:**
\`\`\`bash
npm run dev
\`\`\`

**Terminal 2 - ML API (Optional):**
\`\`\`bash
cd ml-api
uvicorn main:app --reload --port 5000
\`\`\`

Visit `http://localhost:3000`





## 🤖 ML Model

The department prediction model uses:
- **SBERT** (all-MiniLM-L6-v2) for text embeddings
- **Logistic Regression** for classification
- **Accuracy**: ~85% on test data


]




## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Email: pawarharish9403@gmail.com

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- ML powered by Sentence Transformers
- Icons by Heroicons
- Maps by Leaflet

---

**Made with ❤️ for better civic engagement**

