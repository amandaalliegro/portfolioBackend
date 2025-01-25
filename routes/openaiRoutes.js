const express = require('express');
/**
 * Express Router for handling OpenAI-related routes.
 * 
 * @module routes/openaiRoutes
 */

const { generateList, generateMissingItems } = require('../controllers/openaiController');

const router = express.Router();

/**
 * POST /generate-list
 * 
 * Route to generate a bullet list based on a given topic using OpenAI.
 * 
 * @name POST/generate-list
 * @function
 * @memberof module:routes/openaiRoutes
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the topic.
 * @param {string} req.body.topic - The topic for generating the bullet list.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing the generated bullet list.
 */
router.post('/generate-list', generateList);

/**
 * POST /generate-missing-items
 * 
 * Route to generate missing items for a given topic and count using OpenAI.
 * 
 * @name POST/generate-missing-items
 * @function
 * @memberof module:routes/openaiRoutes
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the topic and count.
 * @param {string} req.body.topic - The topic for generating the missing items.
 * @param {number} req.body.count - The number of missing items to generate.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing the generated items as an array.
 */
router.post('/generate-missing-items', generateMissingItems);

module.exports = router;
