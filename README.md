# PeoplePost - Civic Issue Reporting Platform

A modern web application that empowers citizens to report civic issues and enables government officials to manage and resolve them efficiently. Features AI-powered department routing using machine learning, real-time notifications, and community upvoting.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## ✨ Features

### For Citizens
- 📍 **Precise GPS Reporting** - Capture exact location of issues with drag-and-drop map support
- 📸 **Photo Upload** - Attach up to 5 images per report (auto-compressed for fast upload)
- 🤖 **AI Department Routing** - ML model instantly predicts the correct government department
- ⬆️ **Community Upvoting** - Upvote important issues to bring them to the top of the official's list
- 🔔 **Real-Time Updates** - Get instant in-app sliding notifications when your issue is updated
- 📧 **Email Alerts** - Receive beautifully formatted HTML emails for status changes

### For Officials
- 📋 **Dashboard** - Manage all reported issues sorted by community upvotes
- 🗺️ **Map View** - Visualize issues geographically
- 🔍 **Advanced Filtering** - Filter by status, date, and category
- ✅ **Status Management** - Update issue status (Pending, In Progress, Resolved, Rejected)
- 🔄 **Manual Reassignment** - Override the AI prediction if an issue belongs to a different department

### Technical Features
- 🎨 **Modern UI/UX** - Gradient backgrounds, glassmorphism, dynamic animations
- 🔐 **Secure Authentication** - Supabase Auth with strict Row Level Security (RLS) policies
- 🚀 **Real-Time DB** - Supabase Realtime subscriptions for instant client UI updates
- 🤖 **ML Integration** - Custom Python Flask API using Scikit-learn for text classification

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React Leaflet
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Emails**: Resend API
- **ML API**: Python (Flask / Gunicorn)

### ML Model
- **Framework**: Scikit-learn
- **Embeddings**: Sentence Transformers (SBERT)
- **Model**: Logistic Regression Classifier
- **Departments**: Roads, Streetlight, Water & Drainage, Waste Management, Animal Control, Other

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- Resend account (for emails)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Hp3258/PeoplePost.git
cd PeoplePost
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**ML API (Optional, for local development):**
```bash
cd ml-api
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
RESEND_API_KEY=your_resend_api_key
```

### 4. Database Setup
Run the `supabase_setup.sql` file in your Supabase SQL Editor to instantly generate all required tables, Row Level Security (RLS) policies, and Realtime publications.

### 5. Run Development Servers

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - ML API (Optional):**
```bash
cd ml-api
python app.py
```

Visit `http://localhost:3000`

## 🤖 ML Model

The department prediction model uses:
- **SBERT** (all-MiniLM-L6-v2) for generating text embeddings from the report's title and description
- **Logistic Regression** for high-speed, lightweight classification
- Built with a 5-second fallback timeout to ensure the app never hangs if the ML server goes down.

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

