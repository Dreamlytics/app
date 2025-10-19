# Dreamlytics 2.0 - Dream Tracking App

A beautiful dream tracking application built with Nuxt 4, TypeScript, MongoDB, and SCSS.

## Features

✨ **Authentication**
- JWT-based authentication
- Email/password registration and login
- Secure cookie storage

🌙 **Dream Management**
- Create, read, update, and delete dreams
- Rich dream content with title, date, and detailed description
- Tag system for categorizing dreams (e.g., "water", "flight", "lucid")
- Public/private toggle for dream visibility

🎨 **Beautiful UI**
- Fancy gradient backgrounds
- Smooth animations and transitions
- Responsive design
- Dark theme optimized for night usage

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: SCSS with custom variables
- **Backend**: Nuxt built-in server API
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up MongoDB**:
   - Make sure MongoDB is running locally on `mongodb://localhost:27017`
   - Or update `MONGODB_URI` in `.env` file with your connection string

3. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Update `JWT_SECRET` with a secure secret key
   - Update `MONGODB_URI` if needed

4. **Run development server**:
```bash
npm run dev
```

5. **Open your browser**:
   - Navigate to `http://localhost:3000`

## Project Structure

```
dreamlytics 2.0/
├── assets/
│   └── styles/
│       ├── main.scss          # Global styles
│       └── variables.scss     # SCSS variables
├── composables/
│   ├── useAuth.ts            # Authentication composable
│   └── useDreams.ts          # Dreams management composable
├── pages/
│   ├── index.vue             # Home/Dashboard
│   ├── login.vue             # Login page
│   ├── register.vue          # Registration page
│   └── dreams/
│       ├── new.vue           # Create dream
│       └── [id]/
│           ├── index.vue     # View dream
│           └── edit.vue      # Edit dream
├── server/
│   ├── api/
│   │   ├── auth/            # Auth endpoints
│   │   └── dreams/          # Dream CRUD endpoints
│   ├── models/
│   │   ├── User.ts          # User model
│   │   └── Dream.ts         # Dream model
│   ├── plugins/
│   │   └── mongoose.ts      # MongoDB connection
│   └── utils/
│       └── auth.ts          # Auth utilities
└── nuxt.config.ts           # Nuxt configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Dreams
- `GET /api/dreams` - Get all dreams (with pagination and filters)
- `POST /api/dreams` - Create new dream
- `GET /api/dreams/:id` - Get dream by ID
- `PUT /api/dreams/:id` - Update dream
- `DELETE /api/dreams/:id` - Delete dream

## Features to Add

- Dream analytics and insights
- Dream search functionality
- Export dreams to PDF
- Dream sharing with friends
- Dream interpretation AI
- Sleep pattern tracking
- Dream journal themes

## License

MIT
