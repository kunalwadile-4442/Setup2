
## 🧾 Dynamic Portfolio API – Node.js + Express + MongoDB

This is a backend API built for managing a dynamic personal portfolio with user authentication, resume/image upload, and editable sections like hero, about, education, projects, tech stack, experience, and contact form.

---

### 🔧 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB + Mongoose**
* **Cloudinary** (File/Image uploads)
* **JWT** (Authentication)
* **bcrypt** (Password hashing)
* **multer** (File parsing)
* **cookie-parser** (Token in cookies)
* **dotenv**

---

## 🚀 Features

* ✅ User Register/Login (Email or Username)
* 🔒 JWT Auth (Access + Refresh Token)
* 📝 Hero Section (Profile Image, Designation, Resume)
* 🎓 About + Education
* 🧠 Tech Stack (Title + Icon)
* 📁 Projects (Image, Title, Description, Live Link)
* 💼 Experience (Company, Role, Duration, Description)
* 📬 Contact Form
* 📄 Resume upload/download (PDF via Cloudinary)
* 🖼️ Image Upload via Cloudinary

---

## 📁 Folder Structure

```
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── public/
├── config/
├── .env
├── app.js
├── index.js
├── constants.js
├── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in root with:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/youtube
CORS_ORIGIN=*
LIMIT_JSON=5mb
BCRYPT_SALT_ROUNDS=10
# openssl rand -hex 64
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## 🔌 Installation

```bash
git clone https://github.com/kunalwadile-4442/Personal_Portfolio_backend.git
npm install
```

---

## ▶️ Run the Project

```bash
# Start in dev mode
npm run dev

# OR start in production
npm start
```

---

## 🔗 API Routes

| Route                           | Method | Description                  |
| ------------------------------- | ------ | ---------------------------- |
| `/api/v1/users/register`        | POST   | Register user                |
| `/api/v1/users/login`           | POST   | Login with email or username |
| `/api/v1/users/logout`          | POST   | Logout user                  |
| `/api/v1/users/update-profile`  | PATCH  | Update profile info          |
| `/api/v1/users/change-password` | POST   | Change current password      |
| `/api/v1/users/current-user`    | GET    | Get current user             |
| `/api/v1/portfolio/hero`        | POST   | Create hero section          |

---

## 📂 Upload Guidelines

* `profileImage` (image): JPG/PNG
* `resumeLink` (PDF): Should be uploaded with `resource_type: "raw"` and `type: "upload"` to make it publicly accessible.

---

## 🛡️ Security

* All sensitive routes use JWT access token in headers
* Refresh token stored in `HttpOnly` cookies
* Passwords are hashed using `bcrypt`

---

## ✍️ Author

**Kunal Wadile**

---

Let me know if you'd like this in Hindi, or tailored further for frontend setup or deployment instructions.


# 🔌 WebSocket API Guide

## What are WebSockets?

WebSockets provide **real-time, bidirectional communication** between client and server. Unlike REST APIs that follow request-response pattern, WebSockets maintain a persistent connection allowing both client and server to send data at any time.

### WebSocket vs REST API

| Feature | REST API | WebSocket |
|---------|----------|-----------|
| Communication | Request-Response | Bidirectional |
| Connection | Stateless | Persistent |
| Real-time | No | Yes |
| Overhead | Higher (HTTP headers) | Lower |
| Use Cases | CRUD operations | Real-time updates, chat, live data |

## 🚀 Socket.IO Features

Socket.IO is a library that enables real-time communication with features like:
- **Automatic fallback** (WebSocket → HTTP long-polling)
- **Room management** for grouping connections
- **Event-based communication**
- **Automatic reconnection**
- **Binary support**

## 📁 Project Structure

\`\`\`
src/
├── socket/
│   ├── socketHandler.js          # Main socket initialization
│   ├── middlewares/
│   │   ├── socketAuth.js         # Authentication middleware
│   │   └── socketPermission.js   # Permission-based middleware
│   ├── handlers/
│   │   ├── userHandlers.js       # User-specific socket events
│   │   └── adminHandlers.js      # Admin-specific socket events
│   └── utils/
│       └── socketResponse.js     # Response utilities
\`\`\`

## 🔐 Authentication & Authorization

### 1. Socket Authentication
\`\`\`javascript
// Client sends token during connection
const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});
\`\`\`

### 2. Role-Based Access
- **Users**: Can access `user:*` events
- **Admins**: Can access both `user:*` and `admin:*` events

### 3. Action-Based Permissions
\`\`\`javascript
const permissions = {
  admin: ["users:read", "users:write", "users:delete", "system:monitor"],
  user: ["profile:read", "profile:write"]
};
\`\`\`

## 📡 Available Socket Events

### User Events (All authenticated users)
- `user:getProfile` - Get user profile
- `user:updateStatus` - Update user status
- `user:subscribe` - Subscribe to notifications

### Admin Events (Admin users only)
- `admin:getAllUsers` - Get all users with pagination
- `admin:monitorUsers` - Get system statistics
- `admin:broadcast` - Send message to all users
- `admin:deleteUser` - Delete a user

### Real-time Events (Server → Client)
- `notification` - General notifications
- `user:statusChanged` - User status updates
- `user:deleted` - User deletion notifications

## 🧪 Testing Your WebSocket API

### Method 1: HTML Test Page
1. Open `http://localhost:8000/socket-test.html`
2. Get JWT token from REST API login
3. Paste token and connect
4. Test different events

### Method 2: Postman (WebSocket Support)
1. Create new WebSocket request
2. URL: `ws://localhost:8000/socket.io/?EIO=4&transport=websocket`
3. Add authentication in connection

### Method 3: JavaScript Client
\`\`\`javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});

// Test user profile
socket.emit('user:getProfile', (response) => {
  console.log('Profile:', response);
});

// Test admin get users
socket.emit('admin:getAllUsers', { page: 1, limit: 10 }, (response) => {
  console.log('Users:', response);
});
\`\`\`

## 🔧 Environment Setup

Add to your `.env` file:
\`\`\`env
# Existing variables...
SOCKET_CORS_ORIGIN=http://localhost:5173
\`\`\`

## 📦 Required Dependencies

\`\`\`bash
npm install socket.io
\`\`\`

## 🚀 Starting the Server

\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

The server will start on the configured PORT with both REST API and WebSocket support.

## 🔍 Debugging Tips

1. **Check Connection**: Monitor browser console for connection errors
2. **Authentication**: Ensure JWT token is valid and not expired
3. **Permissions**: Verify user role matches required permissions
4. **Events**: Use browser dev tools to monitor WebSocket frames
5. **Server Logs**: Check server console for detailed error messages

## 📊 Real-time Features Examples

### 1. Live User Count
\`\`\`javascript
// Admin can monitor online users in real-time
socket.emit('admin:monitorUsers', (stats) => {
  console.log(`Online: ${stats.data.onlineUsers}`);
});
\`\`\`

### 2. Instant Notifications
\`\`\`javascript
// Server broadcasts to all users
io.emit('notification', {
  type: 'info',
  message: 'System maintenance in 10 minutes',
  timestamp: new Date()
});
\`\`\`

### 3. User Status Updates
\`\`\`javascript
// User updates status, admins get notified
socket.emit('user:updateStatus', { status: 'busy' });
// Admins receive: user:statusChanged event
\`\`\`

## 🛡️ Security Best Practices

1. **Always authenticate** socket connections
2. **Validate permissions** for each event
3. **Sanitize input data** from clients
4. **Rate limit** socket events to prevent spam
5. **Use HTTPS/WSS** in production
6. **Implement proper error handling**

## 🚀 Production Deployment

1. **Use Redis adapter** for multiple server instances
2. **Enable sticky sessions** for load balancing
3. **Configure proper CORS** settings
4. **Monitor connection counts** and performance
5. **Implement graceful shutdowns**

This setup provides a robust, scalable WebSocket API with proper authentication, authorization, and real-time capabilities!



