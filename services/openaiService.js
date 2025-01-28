const openai = require('../config/openaiConfig');

/**
 * Generates a bullet list of 10 helpful and ethical tips on a given topic using OpenAI.
 * 
 * @async
 * @function generateBulletList
 * @param {string} topic - The topic for which the bullet list is to be generated.
 * @returns {Array<string>} An array of bullet list items.
 * @throws {Error} Throws an error if the OpenAI API request fails.
 */
exports.generateBulletList = async (topic) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Create a bullet list of 10 helpful and ethical tips on how to accomplish the following topic: "${topic}". Do not number the items.`,
      },
    ],
  });

  // Format and return the response as an array of bullet list items
  return response.choices[0].message.content
    .trim()
    .split('\n') // Split the response into lines
    .filter(item => item.trim() !== ''); // Remove empty lines
};

/**
 * Generates a specified number of new bullet list items for a given topic using OpenAI.
 * 
 * @async
 * @function generateMissingItems
 * @param {string} topic - The topic for which the missing items are to be generated.
 * @param {number} count - The number of items to generate.
 * @returns {Array<string>} An array of new bullet list items.
 * @throws {Error} Throws an error if the OpenAI API request fails.
 */
exports.generateMissingItems = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    // Format and return the response as an array of bullet list items
    return response.choices[0].message.content
      .trim()
      .split('\n') // Split the response into lines
      .map((item) => item.trim()) // Trim each line
      .filter((item) => item); // Remove empty lines
  } catch (error) {
    console.error('Error generating missing items:', error.message);
    throw new Error('Error generating missing items');
  }
};
