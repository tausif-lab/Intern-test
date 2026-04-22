# API Documentation - Structured Response Format

## Overview

All API responses follow a standardized JSON structure for consistency, security, and better client-side handling.

## Response Format

### Success Response (2xx Status Code)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data goes here
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Error Response (4xx/5xx Status Code)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### Register

**POST** `/api/auth/register`

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "user"
}
```

**Validation Rules:**

- `fullName`: Required, min 2 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters, must contain uppercase, lowercase, and numbers
- `confirmPassword`: Must match password
- `role`: Must be "admin" or "user"

**Success Response (201):**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Validation Rules:**

- `email`: Required, valid email format
- `password`: Required
- `role`: Must be "admin" or "user"

**Success Response (200):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "/user-dashboard?userID=507f1f77bcf86cd799439011",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

---

## Task Endpoints

### All endpoints require authentication

**Header:** `Authorization: Bearer <token>`

### Get Tasks

**GET** `/api/tasks`

**Success Response (200):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Complete Project",
        "description": "Finish the project requirements",
        "status": "pending",
        "priority": "high",
        "assignedTo": {
          "_id": "507f1f77bcf86cd799439011",
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "assignedBy": {
          "_id": "507f1f77bcf86cd799439010",
          "fullName": "Admin User",
          "email": "admin@example.com"
        },
        "dueDate": "2024-05-01T00:00:00.000Z",
        "createdAt": "2024-04-22T10:30:00.000Z",
        "updatedAt": "2024-04-22T10:30:00.000Z"
      }
    ]
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Create Task (Admin Only)

**POST** `/api/tasks`

**Request Body:**

```json
{
  "title": "Complete Project",
  "description": "Finish the project requirements",
  "assignedTo": "507f1f77bcf86cd799439011",
  "priority": "high",
  "dueDate": "2024-05-01"
}
```

**Validation Rules:**

- `title`: Required, 3-100 characters
- `description`: Optional, max 500 characters
- `assignedTo`: Required, valid MongoDB ID
- `priority`: Optional, must be "low", "medium", or "high"
- `dueDate`: Optional, ISO 8601 format, cannot be in the past

**Success Response (201):**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Complete Project",
      "description": "Finish the project requirements",
      "status": "pending",
      "priority": "high",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "assignedBy": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "Admin User",
        "email": "admin@example.com"
      },
      "dueDate": "2024-05-01T00:00:00.000Z",
      "createdAt": "2024-04-22T10:30:00.000Z",
      "updatedAt": "2024-04-22T10:30:00.000Z"
    }
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Update Task Status

**PATCH** `/api/tasks/:id/status`

**Request Body:**

```json
{
  "status": "completed"
}
```

**Validation Rules:**

- `status`: Required, must be "pending" or "completed"
- `id`: Must be valid MongoDB ID

**Success Response (200):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Task status updated successfully",
  "data": {
    "task": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Complete Project",
      "status": "completed",
      "priority": "high",
      "assignedTo": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "assignedBy": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "Admin User",
        "email": "admin@example.com"
      },
      "dueDate": "2024-05-01T00:00:00.000Z",
      "createdAt": "2024-04-22T10:30:00.000Z",
      "updatedAt": "2024-04-22T10:30:00.000Z"
    }
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Delete Task (Admin Only)

**DELETE** `/api/tasks/:id`

**Validation Rules:**

- `id`: Must be valid MongoDB ID

**Success Response (200):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Task deleted successfully",
  "data": {
    "taskId": "507f1f77bcf86cd799439012"
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### Get All Users (Admin Only)

**GET** `/api/tasks/users`

**Success Response (200):**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "role": "user"
      }
    ]
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

---

## Error Responses

### 400 - Validation Error

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address",
      "value": "not-an-email"
    },
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, and numbers",
      "value": "lowercase123"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 401 - Unauthorized

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Not authenticated. Token missing.",
  "data": null,
  "errors": [
    {
      "message": "Authorization token required"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 403 - Forbidden

```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Access denied. Admins only.",
  "data": null,
  "errors": [
    {
      "message": "This action requires admin privileges"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 409 - Conflict (Duplicate Resource)

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "User already exists with this email",
  "data": null,
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 422 - Unprocessable Entity (Validation Failed)

```json
{
  "status": "error",
  "statusCode": 422,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "title",
      "message": "Task title is required",
      "value": ""
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 500 - Server Error

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Internal server error",
  "data": null,
  "errors": [
    {
      "message": "Internal server error"
    }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

---

## Key Features

### ✅ Structured JSON Responses

- Every API response follows the same structure
- Clear distinction between success and error states
- Consistent timestamp for logging and debugging

### ✅ Express Validator Integration

- Input validation on all routes
- Detailed error messages for each field
- Type checking, length validation, and custom rules
- Prevents invalid data from reaching controllers

### ✅ Authentication Middleware

- JWT token-based authentication
- `protect` middleware for authenticated routes
- `adminOnly` middleware for admin-only routes
- Clear error messages for auth failures

### ✅ Status Code Standards

- `200`: Successful GET/PATCH request
- `201`: Successful resource creation
- `400`: Validation errors
- `401`: Unauthorized/Token missing/Expired
- `403`: Forbidden/Insufficient permissions
- `404`: Resource not found
- `409`: Conflict/Duplicate resource
- `422`: Unprocessable entity (validation error)
- `500`: Server error

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install express-validator
```

### 2. Middleware Setup

All validation and error handling are automatically applied in the routes.

### 3. Usage Example

**Client-side (JavaScript/Axios):**

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Set token in headers
const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Register
try {
  const response = await API.post("/auth/register", {
    fullName: "John Doe",
    email: "john@example.com",
    password: "SecurePass123",
    confirmPassword: "SecurePass123",
    role: "user",
  });

  if (response.data.status === "success") {
    const { token, user } = response.data.data;
    setAuthToken(token);
    console.log("Registered:", user);
  }
} catch (error) {
  if (error.response?.data?.errors) {
    error.response.data.errors.forEach((err) => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
}

// Login
try {
  const response = await API.post("/auth/login", {
    email: "john@example.com",
    password: "SecurePass123",
    role: "user",
  });

  if (response.data.status === "success") {
    const { token, redirectUrl, user } = response.data.data;
    setAuthToken(token);
    window.location.href = redirectUrl;
  }
} catch (error) {
  console.error(error.response?.data?.message);
}

// Get Tasks
try {
  const response = await API.get("/tasks");
  if (response.data.status === "success") {
    const { tasks } = response.data.data;
    console.log("Tasks:", tasks);
  }
} catch (error) {
  if (error.response?.status === 401) {
    console.error("Please login again");
    setAuthToken(null);
  }
}

// Create Task
try {
  const response = await API.post("/tasks", {
    title: "New Task",
    description: "Task description",
    assignedTo: "507f1f77bcf86cd799439011",
    priority: "high",
    dueDate: "2024-05-01",
  });

  if (response.data.status === "success") {
    console.log("Task created:", response.data.data.task);
  }
} catch (error) {
  if (error.response?.data?.errors) {
    error.response.data.errors.forEach((err) => {
      console.error(`${err.field}: ${err.message}`);
    });
  }
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire in 24 hours
- Passwords are hashed using bcryptjs
- MongoDB IDs must be valid ObjectIds (24-character hex strings)
- All string inputs are trimmed and validated
- Emails are normalized to lowercase
