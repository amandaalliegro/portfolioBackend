const githubClient = require('../config/githubConfig');

/**
 * Service class to interact with the GitHub API and process repository data.
 */
class GithubService {
  /**
   * Fetches the repositories of a specified GitHub user.
   * @async
   * @param {string} username - The GitHub username.
   * @returns {Array} List of repositories for the user.
   * @throws Will throw an error if the API request fails.
   */
  async getUserRepos(username) {
    try {
      const response = await githubClient.get(`/users/${username}/repos`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error.message);
      throw error;
    }
  }

  /**
   * Fetches the commit count for a specific repository.
   * @async
   * @param {string} username - The GitHub username.
   * @param {string} repoName - The repository name.
   * @returns {number} The number of commits in the repository.
   * @throws Will throw an error if the API request fails or the repository is empty.
   */
  async getRepoCommitCount(username, repoName) {
    try {
      const response = await githubClient.get(`/repos/${username}/${repoName}/commits`);
      return response.data.length;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.warn(`Repository ${repoName} is empty or has no commits.`);
        return 0;
      }
      throw error;
    }
  }

  /**
   * Fetches the code frequency data (lines added and deleted) for a specific repository.
   * @async
   * @param {string} username - The GitHub username.
   * @param {string} repoName - The repository name.
   * @returns {Object} An object containing the total lines added and deleted.
   * @throws Will throw an error if the API request fails or data is unavailable.
   */
  async getRepoCodeFrequency(username, repoName) {
    try {
      const response = await githubClient.get(`/repos/${username}/${repoName}/stats/code_frequency`);
      const weeklyData = response.data;

      let totalAdded = 0;
      let totalDeleted = 0;

      if (Array.isArray(weeklyData)) {
        weeklyData.forEach((week) => {
          totalAdded += week[1]; // Lines added
          totalDeleted += week[2]; // Lines deleted
        });
      } else {
        console.warn(`Code frequency data is not yet available for repository: ${repoName}`);
      }

      return { added: totalAdded, deleted: totalDeleted };
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.warn(`Code frequency data is not yet available for repository: ${repoName}`);
        return { added: 0, deleted: 0 };
      }
      console.error(`Error fetching code frequency for ${repoName}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetches total code statistics (lines added and deleted) across all non-empty repositories for a user.
   * @async
   * @param {string} username - The GitHub username.
   * @returns {Object} An object containing total lines added and deleted.
   * @throws Will throw an error if the API request fails.
   */
  async getTotalCodeStats(username) {
    try {
      const repos = await this.getUserRepos(username);
      const nonEmptyRepos = repos.filter((repo) => repo.size > 0); // Filter out empty repos

      const repoStats = await Promise.all(
        nonEmptyRepos.map((repo) => this.getRepoCodeFrequency(username, repo.name))
      );

      let totalAdded = 0;
      let totalDeleted = 0;

      repoStats.forEach((stats) => {
        totalAdded += stats.added;
        totalDeleted += stats.deleted;
      });

      return { totalAdded, totalDeleted };
    } catch (error) {
      console.error('Error fetching total code stats:', error.message);
      throw error;
    }
  }

  /**
   * Fetches the total commit count across all repositories for a user.
   * @async
   * @param {string} username - The GitHub username.
   * @returns {number} Total commit count.
   * @throws Will throw an error if the API request fails.
   */
  async getTotalCommitCount(username) {
    try {
      const repos = await this.getUserRepos(username);
      const commitCounts = await Promise.all(
        repos.map((repo) => this.getRepoCommitCount(username, repo.name))
      );
      return commitCounts.reduce((acc, commits) => acc + commits, 0);
    } catch (error) {
      console.error('Error fetching total commit count:', error);
      throw error;
    }
  }
}

module.exports = new GithubService();
