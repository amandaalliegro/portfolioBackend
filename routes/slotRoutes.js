/**
 * Express Router for handling slot-related routes.
 * 
 * @module routes/slotRoutes
 */

 const express = require('express');
 const { bookSlot, broadcastSlots, getAvailableSlots } = require('../controllers/slotController');
 
 const router = express.Router();
 
 /**
  * GET /available-slots
  * 
  * Route to fetch all available slots.
  * 
  * @name GET/available-slots
  * @function
  * @memberof module:routes/slotRoutes
  * @inner
  * @param {Object} req - The HTTP request object.
  * @param {Object} res - The HTTP response object.
  * @returns {Object} JSON response containing the available slots.
  */
 router.get('/available-slots', getAvailableSlots);
 
 /**
  * POST /broadcast
  * 
  * Route to broadcast the latest slots to WebSocket clients.
  * 
  * @name POST/broadcast
  * @function
  * @memberof module:routes/slotRoutes
  * @inner
  * @param {Object} req - The HTTP request object.
  * @param {Object} res - The HTTP response object.
  * @returns {Object} JSON response indicating the success of the broadcast operation.
  */
 router.post('/broadcast', broadcastSlots);
 
 /**
  * POST /book
  * 
  * Route to book a specific slot.
  * 
  * @name POST/book
  * @function
  * @memberof module:routes/slotRoutes
  * @inner
  * @param {Object} req - The HTTP request object.
  * @param {Object} req.body - The request body containing booking details.
  * @param {number} req.body.id - The ID of the slot to be booked.
  * @param {string} req.body.fullName - The full name of the user booking the slot.
  * @param {string} req.body.email - The email of the user booking the slot.
  * @param {string} req.body.phone - The phone number of the user.
  * @param {number} req.body.unitId - The ID of the unit associated with the slot.
  * @param {Object} res - The HTTP response object.
  * @returns {Object} JSON response indicating the success or failure of the booking operation.
  */
 router.post('/book', bookSlot);
 
 module.exports = router;
 