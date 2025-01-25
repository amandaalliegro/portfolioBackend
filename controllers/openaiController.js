const openaiService = require('../services/openaiService');

/**
 * Generates a bullet list of items related to the specified topic using OpenAI.
 *
 * @function generateList
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the topic.
 * @param {string} req.body.topic - The topic for generating the bullet list.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing the generated bullet list.
 *
 * @throws {Error} Returns an error response if OpenAI fails to generate the list.
 */
exports.generateList = async (req, res) => {
  // Extract the topic from the request body
  const { topic } = req.body;

  // Validate the input: Ensure the topic is provided
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' }); // Respond with 400 if topic is missing
  }

  try {
    // Call the OpenAI service to generate the bullet list
    const bulletList = await openaiService.generateBulletList(topic);

    // Respond with the generated bullet list
    res.status(200).json({ bulletList });
  } catch (error) {
    // Log the error and send a generic error message
    console.error('Error generating bullet list:', error.message);
    res.status(500).json({ message: 'Error generating bullet list' });
  }
};

/**
 * Generates missing bullet list items for the specified topic using OpenAI.
 *
 * @function generateMissingItems
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the topic and count.
 * @param {string} req.body.topic - The topic for generating the missing items.
 * @param {number} req.body.count - The number of missing items to generate.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing the generated items as an array of strings.
 *
 * @throws {Error} Returns an error response if OpenAI fails to generate the items.
 */
exports.generateMissingItems = async (req, res) => {
  // Extract the topic and count from the request body
  const { topic, count } = req.body;

  // Validate the input: Ensure topic and count are provided and count is positive
  if (!topic || !count || count <= 0) {
    return res.status(400).json({ message: 'Invalid input data' }); // Respond with 400 if validation fails
  }

  try {
    // Call the OpenAI service to generate the missing items
    const newItems = await openaiService.generateMissingItems(topic, count);

    // Respond with the generated items
    res.status(200).json(newItems);
  } catch (error) {
    // Log the error and send a generic error message
    console.error('Error generating missing items:', error.message);
    res.status(500).json({ message: 'Error generating missing items' });
  }
};
