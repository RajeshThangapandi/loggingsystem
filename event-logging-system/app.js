const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const eventLogRoutes = require('./routes/eventLogRoutes');

const app = express();
const PORT = 9000;

// Database Connection
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/events', eventLogRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
