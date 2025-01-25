const nodemailer = require('nodemailer');

/**
 * Sends an email with the specified name, email, and message.
 * 
 * @function sendEmail
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the email details.
 * @param {string} req.body.name - The sender's name.
 * @param {string} req.body.email - The sender's email address.
 * @param {string} req.body.message - The content of the message.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response indicating success or failure of email delivery.
 * 
 * @throws {Error} Throws an error if sending the email fails.
 */
exports.sendEmail = async (req, res) => {
  // Destructure the name, email, and message from the request body
  const { name, email, message } = req.body;

  // Validate the input: Ensure all fields are provided
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'amanda.m.arnaut@gmail.com', // Sender email address
        pass: process.env.EMAIL_APP_PASSWORD, // App-specific password from the .env file
      },
    });

    // Define the email options (recipient, sender, subject, and body)
    const mailOptions = {
      from: email, // Sender's email (provided by the user)
      to: 'amanda.m.arnaut@gmail.com', 
      subject: `Message from ${name}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    };

    // Send the email using the configured transporter
    await transporter.sendMail(mailOptions);
    
    // Respond with a success message if the email is sent
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific nodemailer errors
    if (error.response) {
      return res.status(500).json({ message: 'Failed to send the email. Please try again later.' });
    }
    
    // Respond with a 500 status code if there is an error
    res.status(500).json({ message: 'Error sending email.' });
  }
};
