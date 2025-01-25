const WebSocket = require('ws');

// Store active WebSocket connections
let clients = new Set();

/**
 * Setup WebSocket server and define its behavior
 * @param {http.Server} server - The HTTP server to attach the WebSocket server to
 * @param {object} pool - PostgreSQL connection pool for database queries
 * @returns {object} - Broadcast function for sending messages to all clients
 */
function setupWebSocket(server, pool) {
  // Attach the WebSocket server to the HTTP server
  const wss = new WebSocket.Server({ server });

  // Handle new client connections
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');
    clients.add(ws);

    // Send initial slots data to the connected client
    sendInitialSlots(ws, pool);

    // Handle incoming messages from the client
    ws.on('message', (message) => {
      console.log('Received WebSocket message:', message);
      // Add custom logic for processing incoming messages here if needed
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized');

  /**
   * Broadcast a message to all connected clients
   * @param {object} data - The data to broadcast
   */
   function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  

  return { broadcast };
}

/**
 * Fetch initial slots from the database and send to a specific client
 * @param {WebSocket} ws - The WebSocket client to send the data to
 * @param {object} pool - PostgreSQL connection pool
 */
async function sendInitialSlots(ws, pool) {
  try {
    const result = await pool.query('SELECT * FROM slots');
    const slots = result.rows;
    ws.send(JSON.stringify(slots));
  } catch (error) {
    console.error('Error fetching initial slots:', error);
    ws.send(JSON.stringify({ error: 'Failed to fetch initial slots' }));
  }
}

module.exports = { setupWebSocket };
