# 🌙 Dreamlytics App

> **A modern, AI-powered dream analysis and journaling platform for web and mobile.**

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Development](#setup--development)
- [Mobile Build (Android)](#mobile-build-android)
- [Environment Variables](#environment-variables)
- [AI Models](#ai-models)
- [Error Handling & Logging](#error-handling--logging)
- [Screenshots](#screenshots)
- [License](#license)
- [Credits & Acknowledgements](#credits--acknowledgements)

---

## 🧠 Overview
Dreamlytics is a full-stack application designed to help users analyze, journal, and reflect on their dreams using state-of-the-art AI models. Built with Nuxt 3, Capacitor, and MongoDB, it offers a seamless experience on both web and mobile platforms. The backend leverages Nuxt API routes and integrates with OpenRouter for advanced language model capabilities.

---

## ✨ Features
- **AI-Powered Dream Analysis:** Get deep, personalized insights into your dreams using LLMs (e.g., Llama 3, Gemini).
- **Motif & Emotion Extraction:** Automatically identify recurring symbols, emotional patterns, and archetypes.
- **Dream Journal:** Log, edit, and delete your dreams in a secure, private journal.
- **Public Dream Feed:** Explore and like dreams shared by the community.
- **Admin Tools:** Clean up duplicates, fix indexes, and manage analytics.
- **Mobile Support:** Build and run as a native Android app via Capacitor.
- **Authentication:** Register, login, and manage your profile securely.
- **Analytics & Visualization:** View statistics, charts, and emotional timelines.
- **Modern UI:** Responsive, stylish design with SCSS and custom themes.

---

## 🛠️ Technology Stack
- **Frontend:** Nuxt 3 (Vue 3, SSR, Composition API)
- **Mobile:** Capacitor (Android build, native features)
- **Backend:** Nuxt API routes (Node.js-like), MongoDB (Mongoose models)
- **AI Integration:** OpenRouter SDK (LLM models)
- **Languages:** TypeScript, SCSS
- **Other:** Gradle (Android), Express-like middleware

---

## 📁 Project Structure
```
app/
├── android/                # Android build files (Gradle, manifests)
├── assets/styles/          # SCSS, CSS, theme variables
├── composables/            # Vue composables (API, auth, extract, etc.)
├── pages/                  # Nuxt pages (analyze, extract, login, feed, admin, etc.)
├── plugins/                # Nuxt/Vue plugins
├── public/                 # Static assets (manifest, icons)
├── server/
│   ├── api/                # Nuxt API endpoints (analyze, extract, dreams, auth, admin, analytics)
│   ├── models/             # Mongoose models (Dream, User, AILog)
│   └── utils/              # Utility functions (auth, db-setup)
├── assets/                 # Images, fonts, etc.
├── package.json            # Project metadata & scripts
├── nuxt.config.ts          # Nuxt configuration
├── capacitor.config.ts     # Capacitor configuration
├── tsconfig.json           # TypeScript configuration
└── .env                    # Environment variables
```

---

## 🚀 Setup & Development
### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 📱 Mobile Build (Android)
1. **Build the app:**
   ```bash
   npm run build
   ```
2. **Copy web assets to Android:**
   ```bash
   npx cap copy android
   ```
3. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

---

## 🔐 Environment Variables
Configure your `.env` file with:
- `MONGODB_URI` – MongoDB connection string
- `OPENROUTER_API_KEY` – OpenRouter API key for AI models
- Any other secrets required by plugins or analytics

---

## 🤖 AI Models
- **Dream Analysis:** `meta-llama/llama-3.3-8b-instruct:free` (OpenRouter)
- **Motif & Emotion Extraction:** `google/gemini-2.0-flash-exp:free` (or any supported LLM)
- Easily switch models in API handler config for experimentation

---

## ⚠️ Error Handling & Logging
- **Detailed server-side logging:** Each request is tagged with a unique requestId for traceability
- **Rate limit & API key errors:** Clear feedback for users and developers
- **Input validation:** Zod schemas for robust data checking
- **Database logging:** All AI interactions and errors are logged for analytics and debugging

---

## 🖼️ Screenshots
> _Add screenshots of the app here for visual reference._

---

## 📄 License
This project is intended for educational and personal use. For questions or collaboration, contact the developer.

---

## 💡 Credits & Acknowledgements
- [Nuxt](https://nuxt.com/)
- [Capacitor](https://capacitorjs.com/)
- [OpenRouter](https://openrouter.ai/)
- [MongoDB](https://www.mongodb.com/)
- [Llama 3](https://ai.meta.com/llama/)
- [Gemini](https://deepmind.google/)

---

> _Dreamlytics – Unlock the meaning of your dreams with AI._
