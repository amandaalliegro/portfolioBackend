const pool = require('../config/db'); 
const nodemailer = require('nodemailer');
const { getCachedAvailableSlots, slotCache } = require('../services/slotService');

/**
 * Broadcasts the current slots to all connected WebSocket clients.
 * 
 * @function broadcastSlots
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response indicating success or failure of the broadcast.
 */
exports.broadcastSlots = async (req, res) => {
  try {
    const updatedSlot = req.body; // Expect updated slot data in the request body
    const { broadcast } = req.app.locals; 

    // Broadcast only the updated slot
    broadcast([updatedSlot]);
    res.status(200).json({ message: 'Slots broadcasted successfully' });
  } catch (error) {
    console.error('Error broadcasting slots:', error); 
    res.status(500).json({ message: 'Error broadcasting slots' }); 
  }
};

/**
 * Fetches all available slots from the database, including unit names.
 * 
 * @function getAvailableSlots
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing the available slots.
 */
 exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await getCachedAvailableSlots();
    res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error.message);
    res.status(500).json({ message: 'Error fetching available slots' });
  }
};

/**
 * Books a slot and sends a confirmation email to the user.
 * 
 * @function bookSlot
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing slot booking details.
 * @param {number} req.body.id - The ID of the slot to be booked.
 * @param {string} req.body.fullName - The name of the user booking the slot.
 * @param {string} req.body.email - The email of the user booking the slot.
 * @param {string} req.body.phone - The phone number of the user.
 * @param {number} req.body.unitId - The ID of the unit associated with the slot.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response indicating success or failure of the booking.
 */
exports.bookSlot = async (req, res) => {
  const { id, fullName, email, phone, unitId } = req.body;

  // Validate the input: Ensure all required fields are present
  if (!id || !fullName || !email || !phone || !unitId) {
    return res.status(400).json({ message: 'Invalid input data' }); // Respond with 400 if validation fails
  }

  try {
    // Check if the slot exists in the database
    const checkResult = await pool.query('SELECT 1 FROM slots WHERE id = $1 LIMIT 1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Slot not found' }); // Respond with 404 if slot doesn't exist
    }

    // Update the slot to mark it as booked
    await pool.query(
      'UPDATE slots SET is_booked = true, name = $1, email = $2, phone = $3, unit_id = $4 WHERE id = $5',
      [fullName, email, phone, unitId, id]
    );

    // Refresh and broadcast updated slots to WebSocket clients
    const updatedSlots = await pool.query('SELECT * FROM slots');
    const { broadcast } = req.app.locals;
    broadcast(updatedSlots.rows);

    // Update the slot cache
    slotCache.set('available-slots', updatedSlots.rows);

    // Configure the email transporter for sending confirmation emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amanda.m.arnaut@gmail.com', // Sender's email address
        pass: process.env.EMAIL_APP_PASSWORD, // App-specific password loaded from environment variables
      },
    });

    // Send the confirmation email to the user
    await transporter.sendMail({
      from: 'amanda.m.arnaut@gmail.com',
      to: email, 
      subject: 'Appointment Confirmation', 
      text: `Hello ${fullName}, your appointment is confirmed.`,
    });

    // Respond with a success message
    res.status(200).json({ message: 'Slot booked successfully!' });
  } catch (error) {
    console.error('Error booking slot:', error.message); 
    res.status(500).json({ message: 'Error booking slot' }); 
  }
};
