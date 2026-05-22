# Internship Management System - Backend

Backend API for an Internship Management System built with NestJS and TypeScript.

The system is designed to manage internship workflows between students, companies, and administrators, including authentication, internship applications, and role-based management.

---

## 🚀 Repository

* GitHub: [internship-management-be](https://github.com/ThanhDong00/internship-management-be?utm_source=chatgpt.com)

---

## 📌 Overview

This project focuses on building a scalable and maintainable backend architecture using NestJS.

The system provides APIs for:

* User authentication & authorization
* Internship management
* Mentor management
* Internship application workflow
* Role-based access control
* RESTful API development

---

## 🛠 Tech Stack

### Backend

* TypeScript
* NestJS
* Node.js
* REST API

### Database

* PostgreSQL

### ORM

* TypeORM 

### Authentication

* JWT Authentication

### Tools

* Postman
* Git & GitHub

---

## 🧩 System Architecture

```text
Client
   │
   ▼
Controller Layer
   │
   ▼
Service Layer
   │
   ▼
Repository / ORM Layer
   │
   ▼
Database
```

The project follows NestJS modular architecture for scalability and maintainability.

---

## 🔐 Authentication & Authorization

Authentication is implemented using JWT and Passport strategies.

### Features

* Login/Register
* JWT Access Token
* Protected Routes
* Role-based Authorization
* Request Validation

Example:

```http
Authorization: Bearer <access_token>
```

---

## ⚙️ Installation

### 1. Clone repository

```bash
git clone https://github.com/ThanhDong00/internship-management-be.git
cd internship-management-be
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Create `.env` file:

```env
PORT=3000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

---

### 4. Run development server

```bash
npm run start:dev
```

Application runs at:

```bash
http://localhost:3000
```

---

## 🔥 Future Improvements

* Refresh token authentication
* Redis caching
* Docker Compose setup
* CI/CD pipeline
* Unit & Integration Testing
* Cloud deployment
* File upload support
* Real-time notifications

---

## 👨‍💻 Author

### [ThanhDong00 GitHub](https://github.com/ThanhDong00?utm_source=chatgpt.com)

Backend Developer | NestJS Developer

---

## 📄 License

This project is licensed under the MIT License.

