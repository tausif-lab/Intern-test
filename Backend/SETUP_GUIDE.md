# Backend Setup & Implementation Guide

## Changes Made

This document outlines all the improvements made to the backend API for better security, validation, and structured responses.

### 1. **Structured JSON Responses**

All API responses now follow a consistent format with:

- `status`: Either "success" or "error"
- `statusCode`: HTTP status code
- `message`: Human-readable message
- `data`: Response data (for success responses)
- `errors`: Array of error details (for error responses)
- `timestamp`: ISO 8601 timestamp

**Example Success Response:**

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "fullName": "John",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "errors": null,
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

**Example Error Response:**

```json
{
  "status": "error",
  "statusCode": 422,
  "message": "Validation failed",
  "data": null,
  "errors": [
    { "field": "email", "message": "Invalid email address", "value": "invalid" }
  ],
  "timestamp": "2024-04-22T10:30:00.000Z"
}
```

### 2. **Express-Validator Integration**

Added comprehensive input validation to all routes:

**Files Created:**

- `Backend/utils/validators.js` - Centralized validation rules

**Validation Coverage:**

#### Auth Endpoints:

- **Register:** fullName, email, password, confirmPassword, role
- **Login:** email, password, role

#### Task Endpoints:

- **Create Task:** title, description, assignedTo, priority, dueDate
- **Update Status:** status, task ID
- **Delete Task:** task ID

**Features:**

- Type validation (email format, MongoDB ID, etc.)
- Length validation (min/max characters)
- Custom validation rules (password strength, date in future, etc.)
- Automatic error formatting
- HTTP 422 status code for validation failures

### 3. **Enhanced Auth Middleware**

Updated `Backend/middleware/authMiddleware.js`:

- JWT verification with token validation
- User authentication check
- Admin-only route protection
- Structured error responses for all auth failures

**Middleware Usage:**

```javascript
// Protect route - requires authentication
router.get("/tasks", protect, getAllTasks);

// Admin-only route - requires admin role
router.post("/tasks", protect, adminOnly, createTask);
```

### 4. **Improved Error Handling**

Updated `Backend/middleware/errorHandler.js`:

- Structured error responses
- Mongoose validation errors handling
- JWT error handling
- Duplicate key error handling (HTTP 409)
- Default server error handling

### 5. **Response Formatter Utility**

Created `Backend/utils/responseFormatter.js`:

- `successResponse(statusCode, message, data)` - For success responses
- `errorResponse(statusCode, message, errors)` - For error responses
- `formatResponse()` - Base formatter used by both

### 6. **Updated Controllers**

#### Auth Controller (`Backend/controllers/authController.js`):

- Uses structured response format
- Validation is now handled by express-validator
- Removed redundant validation logic
- Clearer error messages

#### Task Controller (`Backend/controllers/taskController.js`):

- All responses use structured format
- Proper HTTP status codes
- Detailed error information
- Consistent data structure

### 7. **Updated Routes**

#### Auth Routes (`Backend/routes/auth.js`):

```javascript
router.post("/register", registerValidators, handleValidationErrors, register);
router.post("/login", loginValidators, handleValidationErrors, login);
```

#### Task Routes (`Backend/routes/tasks.js`):

```javascript
router.get("/", getAllTasks);
router.post(
  "/",
  adminOnly,
  createTaskValidators,
  handleValidationErrors,
  createTask,
);
router.delete(
  "/:id",
  adminOnly,
  deleteTaskValidators,
  handleValidationErrors,
  deleteTask,
);
router.patch(
  "/:id/status",
  updateTaskStatusValidators,
  handleValidationErrors,
  updateTaskStatus,
);
router.get("/users", adminOnly, getAllUsers);
```

---

## Installation & Setup Instructions

### Step 1: Install Dependencies

```bash
cd Backend
npm install
```

The `express-validator` package has been added to `package.json` dependencies.

### Step 2: Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### Step 3: Test the API

#### Using Postman or Insomnia:

**1. Register a User:**

```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "user"
}
```

**2. Login:**

```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**3. Get Tasks (with token):**

```
GET http://localhost:3001/api/tasks
Authorization: Bearer <token_from_login>
```

**4. Create Task (admin only):**

```
POST http://localhost:3001/api/tasks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Complete Project",
  "description": "Finish the project requirements",
  "assignedTo": "507f1f77bcf86cd799439011",
  "priority": "high",
  "dueDate": "2024-05-01"
}
```

---

## File Structure

```
Backend/
├── utils/
│   ├── responseFormatter.js    (NEW) - Structured response utility
│   └── validators.js           (NEW) - Express-validator rules
├── middleware/
│   ├── authMiddleware.js       (UPDATED) - Structured responses
│   ├── errorHandler.js         (UPDATED) - Structured error handling
│   └── activityLogger.js       (unchanged)
├── controllers/
│   ├── authController.js       (UPDATED) - Uses structured responses
│   └── taskController.js       (UPDATED) - Uses structured responses
├── routes/
│   ├── auth.js                 (UPDATED) - Added validators
│   ├── tasks.js                (UPDATED) - Added validators
│   └── index.js                (unchanged)
├── models/
│   ├── User.js                 (unchanged)
│   └── Task.js                 (unchanged)
├── config/
│   └── database.js             (unchanged)
├── package.json                (UPDATED) - Added express-validator
├── server.js                   (unchanged)
├── .env                        (unchanged)
└── API_DOCUMENTATION.md        (NEW) - Complete API documentation
```

---

## Security Improvements

### ✅ Input Validation

- All user inputs are validated using express-validator
- Invalid data is rejected with HTTP 422 status
- Specific error messages for each field

### ✅ Authentication

- JWT token-based authentication
- Token expiration in 24 hours
- Bearer token in Authorization header

### ✅ Authorization

- Role-based access control (admin vs user)
- Protected routes require authentication
- Admin-only routes require admin role

### ✅ Password Security

- Strong password requirements (uppercase, lowercase, numbers)
- Minimum 6 characters
- Hashed using bcryptjs

### ✅ Error Handling

- No sensitive information in error messages
- Consistent error format for better security
- Proper HTTP status codes

---

## Response Status Codes Reference

| Code | Meaning              | Example                      |
| ---- | -------------------- | ---------------------------- |
| 200  | OK                   | Successful GET/PATCH request |
| 201  | Created              | Successful resource creation |
| 400  | Bad Request          | Invalid input format         |
| 401  | Unauthorized         | Token missing or expired     |
| 403  | Forbidden            | Insufficient permissions     |
| 404  | Not Found            | Resource doesn't exist       |
| 409  | Conflict             | Duplicate resource           |
| 422  | Unprocessable Entity | Validation failed            |
| 500  | Server Error         | Internal server error        |

---

## Validation Rules Summary

### Password Validation

- Minimum 6 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)

### Email Validation

- Valid email format
- Normalized to lowercase
- Checked for duplicates

### Task Validation

- Title: 3-100 characters
- Description: Max 500 characters
- Priority: "low", "medium", or "high"
- Due Date: ISO 8601 format, cannot be in the past
- Assigned To: Valid MongoDB ID

---

## Frontend Integration Example

```javascript
// Example with Axios
const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Set token
const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Handle responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      setToken(null);
      window.location.href = "/login";
    }
    if (error.response?.data?.errors) {
      // Show validation errors
      error.response.data.errors.forEach((err) => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
    return Promise.reject(error);
  },
);

// Usage
async function login() {
  try {
    const response = await API.post("/auth/login", {
      email: "john@example.com",
      password: "SecurePass123",
      role: "user",
    });

    if (response.data.status === "success") {
      const { token } = response.data.data;
      setToken(token);
      // Redirect to dashboard
    }
  } catch (error) {
    console.error(error.response?.data?.message);
  }
}
```

---

## Next Steps

1. **Frontend Updates:** Update the frontend to handle the new structured response format
2. **Testing:** Run the API endpoints with the provided examples
3. **Deployment:** Deploy the updated backend to production
4. **Monitoring:** Monitor logs for validation errors and adjust rules as needed

---

## Support

For detailed API documentation, see `API_DOCUMENTATION.md` in the Backend directory.

All endpoints are well-documented with request/response examples and validation rules.
