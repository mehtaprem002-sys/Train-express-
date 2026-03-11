# Train Express - Online Train Booking System

A modern train booking system built with Angular frontend, Node.js/Express backend, and Firebase database.

## 🚀 Features

- **User Registration** with comprehensive validation
- Modern, premium UI with gradient backgrounds and animations
- Firebase Firestore integration for data storage
- Secure password hashing with bcrypt
- Real-time form validation
- Responsive design

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Firebase account

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important**: Replace the values with your actual Firebase credentials from the JSON file you downloaded.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:4200`

## 📱 Using the Application

1. Open your browser and navigate to `http://localhost:4200`
2. You'll be redirected to the registration page
3. Fill in the registration form:
   - **Name**: Only alphabets allowed (minimum 2 characters)
   - **Email**: Valid email format required
   - **Phone**: 10-digit number
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Must match password
   - **Terms & Conditions**: Must be accepted
4. Click "Create Account"
5. Upon successful registration, you'll see a success message

## 🗂️ Project Structure

```
train-express/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env                     # Environment variables (create this)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   └── registration/
    │   │   │       ├── registration.component.ts
    │   │   │       ├── registration.component.html
    │   │   │       └── registration.component.css
    │   │   ├── services/
    │   │   │   └── auth.service.ts
    │   │   ├── app.config.ts
    │   │   └── app.routes.ts
    │   └── ...
    └── package.json
```

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation on both frontend and backend
- CORS protection
- Firebase Admin SDK for secure database access
- Duplicate email detection

## 🎨 UI Features

- Modern gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Responsive design
- Loading states
- Error handling with user-friendly messages

## 📝 API Endpoints

### POST `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123",
  "termsAccepted": true
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful! You can now login.",
  "userId": "firebase-generated-id"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "An account with this email already exists.",
  "errors": [...]
}
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify Firebase credentials in `.env` file
- Ensure all dependencies are installed

### Frontend won't start
- Check if port 4200 is available
- Run `npm install` in the frontend directory
- Clear npm cache: `npm cache clean --force`

### Registration fails
- Check backend console for errors
- Verify Firebase Firestore is enabled in Firebase Console
- Check network tab in browser DevTools for API errors

## 📄 License

MIT

## 👥 Support

For issues and questions, please create an issue in the repository.
