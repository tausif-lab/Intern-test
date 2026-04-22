require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const activityLogger = require('./middleware/activityLogger');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: 'https://intern-test-ez2k.onrender.com', // Next.js frontend
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity logger – logs every POST & PATCH as JSON
app.use(activityLogger);

// Use routes
app.use(routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});

module.exports = app;