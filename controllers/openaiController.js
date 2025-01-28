const openaiService = require('../services/openaiService');
const generatedItemsCache = {}; // In-memory cache for generated items

/**
 * Generates a bullet list of items related to the specified topic using OpenAI.
 * 
 * Populates the cache with the generated items for the topic.
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
    return res.status(400).json({ message: 'Topic is required.' });
  }

  try {
    // Call the OpenAI service to generate the bullet list
    const bulletList = await openaiService.generateBulletList(topic);

    // Populate the cache for this topic
    if (!generatedItemsCache[topic]) {
      generatedItemsCache[topic] = []; // Initialize the cache for the topic
    }
    generatedItemsCache[topic] = [...generatedItemsCache[topic], ...bulletList];

    // Respond with the generated bullet list
    res.status(200).json({ bulletList });
  } catch (error) {
    // Log the error and send a generic error message
    console.error('Error generating bullet list:', error.message);
    res.status(500).json({ message: 'Error generating bullet list' });
  }
};

/**
 * Generates missing bullet list items for the specified topic using OpenAI, avoiding duplicates.
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
  const { topic, count } = req.body;

  // Validate the input
  if (!topic || !count || count <= 0) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    // Retrieve existing items from the cache or initialize an empty list
    if (!generatedItemsCache[topic]) {
      generatedItemsCache[topic] = []; // Initialize cache for the topic if not present
    }
    const existingItems = generatedItemsCache[topic];
    
    // Construct the prompt for OpenAI
    const prompt = `
      You are an assistant tasked with creating a bullet list of items. All items must be:
      - Helpful and practical
      - Ethical, promoting positive values
      - Aligned with socially responsible and legal standards
      
      Avoid any conceptual or semantic overlap with the following existing items:
      ${existingItems.map(item => `- ${item}`).join('\n')}
      
      Generate ${count} new and distinct bullet list items for the topic: "${topic}".
      The items should:
      - Offer fresh, unique perspectives
      - Avoid duplicating or rephrasing ideas from the provided list
      - Exclude any suggestions that could be unethical, harmful, or promote illegal activities
      
      Example of an ethical item:
      - Use eco-friendly packaging to reduce waste.
      
      Example of an unethical item:
      - Exploit loopholes to evade taxes.
      
      Do not enumerate the items in the list.
    `;

    // Call OpenAI to generate new items
    const newItems = await openaiService.generateMissingItems(prompt);

    // Filter out duplicates
    const filteredItems = newItems.filter(item => !existingItems.includes(item));

    // Update the cache with the new items
    generatedItemsCache[topic] = [...existingItems, ...filteredItems];

    // Respond with the filtered list of new items
    res.status(200).json(filteredItems);
  } catch (error) {
    console.error('Error generating missing items:', error.message);
    res.status(500).json({ message: 'Error generating missing items' });
  }
};
