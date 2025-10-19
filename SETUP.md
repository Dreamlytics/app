# 🌙 Dreamlytics 2.0 - Quick Start Guide

## Prerequisites

Before you start, make sure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **MongoDB** installed and running
   ```bash
   # Install MongoDB on macOS:
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB:
   brew services start mongodb-community
   
   # Or run manually:
   mongod --dbpath /path/to/your/data
   ```

## Installation

1. **Install dependencies** (already done if you ran `npm install`):
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - The `.env` file is already set up with defaults
   - For production, update `JWT_SECRET` with a strong secret key
   - Update `MONGODB_URI` if your MongoDB is not on localhost

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   Or use the convenience script:
   ```bash
   ./start.sh
   ```

4. **Open your browser**:
   - Navigate to `http://localhost:3000`

## First Steps

1. **Register an account**:
   - Click "Register" in the navbar
   - Enter your name, email, and password
   - You'll be automatically logged in

2. **Create your first dream**:
   - Click "➕ New Dream" button
   - Fill in the dream details:
     - Title (e.g., "Flying over mountains")
     - Date (when you had the dream)
     - Content (describe your dream in detail)
     - Tags (e.g., "flight", "lucid", "nature")
     - Public/Private toggle (🌍 Public or 🔒 Private)
   - Click "Save Dream"

3. **View your dreams**:
   - All your dreams appear on the home page
   - Filter by tags using the search box
   - Click "View" to see full details
   - Click "Edit" to modify your dream
   - Click "Delete" to remove a dream

## Features

✨ **Authentication**
- Secure JWT authentication with httpOnly cookies
- Email/password login and registration
- Auto-login on return visits

🌙 **Dream Management**
- Create, read, update, and delete dreams
- Rich dream entries with title, date, and content
- Tag system for categorization
- Public/private visibility control

🎨 **Beautiful UI**
- Dark theme optimized for nighttime use
- Gradient backgrounds and smooth animations
- Responsive design works on all devices
- Fancy cards and interactive elements

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running:
```bash
brew services start mongodb-community
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Either stop the other process or change the port:
```bash
PORT=3001 npm run dev
```

### Missing Dependencies
```
Error: Cannot find module 'xyz'
```
**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run generate` - Generate static site

## Project Structure

```
dreamlytics 2.0/
├── assets/styles/        # SCSS styles and variables
├── composables/          # Vue composables (useAuth, useDreams)
├── pages/               # Application pages/routes
│   ├── index.vue        # Home dashboard
│   ├── login.vue        # Login page
│   ├── register.vue     # Registration page
│   └── dreams/          # Dream management pages
├── server/              # Backend API
│   ├── api/            # API endpoints
│   ├── models/         # Database models
│   ├── plugins/        # Server plugins
│   └── utils/          # Utility functions
└── nuxt.config.ts      # Nuxt configuration
```

## API Documentation

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Body: { email, password, name }
```

**Login User**
```
POST /api/auth/login
Body: { email, password }
```

**Logout User**
```
POST /api/auth/logout
```

**Get Current User**
```
GET /api/auth/me
```

### Dream Endpoints

**Get All Dreams**
```
GET /api/dreams?page=1&limit=20&tag=lucid
```

**Create Dream**
```
POST /api/dreams
Body: { title, content, date, tags, isPublic }
```

**Get Dream by ID**
```
GET /api/dreams/:id
```

**Update Dream**
```
PUT /api/dreams/:id
Body: { title, content, date, tags, isPublic }
```

**Delete Dream**
```
DELETE /api/dreams/:id
```

## Tips for Best Experience

1. **Regular Journaling**: Record your dreams immediately after waking for best recall
2. **Use Tags**: Consistent tagging helps identify patterns (e.g., "water", "flying", "lucid")
3. **Privacy Control**: Use private dreams for personal entries, public for sharing
4. **Date Accuracy**: Set the correct date to track dream patterns over time
5. **Rich Details**: The more details you add, the better for future analysis

## What's Next?

Future features to implement:
- 📊 Dream analytics and statistics
- 🔍 Advanced search functionality
- 📄 Export dreams to PDF
- 🤝 Share dreams with friends
- 🤖 AI-powered dream interpretation
- 😴 Sleep pattern tracking
- 🎨 Customizable themes

## Need Help?

- Check the main `README.md` for more information
- Review the code comments in the source files
- MongoDB docs: https://docs.mongodb.com/
- Nuxt docs: https://nuxt.com/docs
- Vue docs: https://vuejs.org/

Happy dreaming! 🌙✨
