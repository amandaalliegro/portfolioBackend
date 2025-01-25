/**
 * Express Router for handling GitHub-related routes.
 * 
 * @module routes/githubRoutes
 */

 const express = require('express');
 const { getStats } = require('../controllers/githubController');
 
 const router = express.Router();
 
 /**
  * GET /stats/:username
  * 
  * Route to fetch GitHub statistics for a given username.
  * 
  * @name GET/stats/:username
  * @function
  * @memberof module:routes/githubRoutes
  * @inner
  * @param {Object} req - The HTTP request object.
  * @param {Object} req.params - The request parameters.
  * @param {string} req.params.username - The GitHub username for which stats are to be fetched.
  * @param {Object} res - The HTTP response object.
  * @returns {Object} JSON response containing the GitHub statistics.
  */
 router.get('/stats/:username', getStats);
 
 module.exports = router;
 