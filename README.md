# 🐞 Bug Tracker – Full Stack Bug Tracking System

A full-stack Bug Tracking System designed to help development teams manage projects, report bugs, assign tasks, track progress, and collaborate efficiently.

## 🚀 Features

- **User Authentication:** Secure signup and login using JWT.
- **Project Management:** Create and manage projects.
- **Team Management:** Add developers to projects and view project members.
- **Bug Management:** Create, assign, edit, and delete bugs.
- **Priority Management:** Organize bugs by priority.
- **Status Tracking:** Track bugs through different development stages.
- **Kanban Board:** Visualize bug progress.
- **Comments:** Collaborate through bug-related comments.
- **Notifications:** Receive notifications for assignments, status changes, and comments.
- **Search and Filters:** Find bugs easily.
- **Dashboard:** View project and bug statistics.
- **Role-Based Access Control:** Manage access based on user roles.

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS / CSS
- Axios
- React Router
- Lucide React
- React Hot Toast

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## 📁 Project Structure

```text
bug-tracker/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/sheetalanand45/bug-tracker.git
cd bug-tracker
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
```

Configure the frontend API URL according to the API configuration in `src/services/api.js`.

Start the frontend:

```bash
npm run dev
```

### 4. Open the application

Visit:

```text
http://localhost:5173
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT authentication |
| CLIENT_URL | Frontend URL for CORS |

**Important:** Never upload `.env` files, database credentials, or secret keys to GitHub.

## 🌐 Deployment

The application is intended to be deployed using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 👩‍💻 Author

**Sheetal Anand**

Computer Science Engineering | Full Stack Developer

GitHub: [@sheetalanand45](https://github.com/sheetalanand45)

## 📄 License

This project is developed for learning and educational purposes.
