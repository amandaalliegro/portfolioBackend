/**
 * Express Router for handling email-related routes.
 * 
 * @module routes/emailRoutes
 */

 const express = require('express');
 const { sendEmail } = require('../controllers/emailController');
 
 const router = express.Router();
 
 /**
  * POST /send-message
  * 
  * Route to send an email message.
  * 
  * @name POST/send-message
  * @function
  * @memberof module:routes/emailRoutes
  * @inner
  * @param {Object} req - The HTTP request object.
  * @param {Object} req.body - The request body containing email details.
  * @param {string} req.body.name - The sender's name.
  * @param {string} req.body.email - The sender's email address.
  * @param {string} req.body.message - The content of the email message.
  * @param {Object} res - The HTTP response object.
  * @returns {Object} JSON response indicating the result of the email operation.
  */
 router.post('/send-message', sendEmail);
 
 module.exports = router;
 