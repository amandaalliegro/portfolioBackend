const express = require('express');
const http = require('http');
const cors = require('cors');
const pool = require('./config/db'); // Import the database pool
const { setupWebSocket } = require('./services/websocket');
const { addSlotsForNextSevenDays, cleanUpExcessSlots } = require('./services/slotService');
const githubRoutes = require('./routes/githubRoutes');
const emailRoutes = require('./routes/emailRoutes');
const openaiRoutes = require('./routes/openaiRoutes');
const slotRoutes = require('./routes/slotRoutes'); // Import slot routes
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';

/**
 * Middleware
 */
app.use(cors({
  origin: [
    'http://localhost:4200', 
    'http://localhost:62432',
    'https://barbershop-amanda.web.app/',
    'https://www.amandaarnaut.com', 
    'https://www.amandaarnaut.com/barbershop/'
  ], // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true
}));
app.use(express.json());

/**
 * Routes
 */
app.use('/api/github', githubRoutes); // GitHub-related routes
app.use('/api', emailRoutes); // Email-related routes
app.use('/api', openaiRoutes); // OpenAI-related routes
app.use('/', slotRoutes); // Slot-related routes

/**
 * Initialize Database
 */
 async function initializeDatabase() {
  try {
    await addSlotsForNextSevenDays();
    await cleanUpExcessSlots(); // Clean up old or duplicate slots
    console.log('Database initialized: Slots for the next 7 days added and cleaned.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}


/**
 * Start the server
 */
async function startServer() {
  // Initialize the database before starting the server
  await initializeDatabase();

  // Create HTTP server
  const server = http.createServer(app);

  // Setup WebSocket server
  const { broadcast } = setupWebSocket(server, pool);
  app.locals.broadcast = broadcast; // Pass the broadcast function to app locals

  // Start listening for requests
  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  });
}

// Start the server
startServer();