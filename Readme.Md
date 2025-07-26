
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




