require('dotenv').config();

const axios = require('axios');

// Create an instance of axios with pre-configured settings for the GitHub API
const githubClient = axios.create({
  baseURL: 'https://api.github.com', 
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, 
    'Content-Type': 'application/json', 
  },
  timeout: 5000, 
});


module.exports = githubClient;
