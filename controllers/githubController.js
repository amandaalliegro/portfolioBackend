const githubService = require('../services/githubService');

/**
 * Fetches GitHub statistics for a specified username, including total commits, lines of code added, and lines deleted.
 * 
 * @function getStats
 * @async
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The GitHub username for which stats are to be fetched.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} JSON response containing GitHub statistics.
 * 
 * @throws {Error} Returns an error response if fetching GitHub stats fails.
 */
exports.getStats = async (req, res) => {
  // Extract the GitHub username from the request parameters
  const { username } = req.params;

  // Validate the input: Ensure the username is provided
  if (!username) {
    return res.status(400).json({ message: 'Username is required.' }); // Respond with 400 if username is missing
  }

  try {
    // Fetch commit count and code statistics concurrently using Promise.all
    const [commitCount, codeStats] = await Promise.all([
      githubService.getTotalCommitCount(username), // Get total commit count
      githubService.getTotalCodeStats(username),   // Get total lines added and deleted
    ]);

    // Respond with the fetched statistics
    res.status(200).json({
      totalCommits: commitCount,
      totalAdded: codeStats.totalAdded,
      totalDeleted: codeStats.totalDeleted,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching GitHub stats:', error);

    // Handle specific errors (e.g., 404 from the GitHub API)
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found.' });
    }

    // Fallback for generic errors
    res.status(500).json({ message: 'Error fetching GitHub stats.' });
  }
};
