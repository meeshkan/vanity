const got = require('got');
const array = require('lodash/array');

const gotOptions = {
	prefixUrl: 'https://api.github.com/',
	responseType: 'json',
};

class RESTGitHubClient {
	constructor(token) {
		this.request = token ?
			got.extend({
				headers: {
					authorization: `token ${token}`,
					accept: 'application/vnd.github.machine-man-preview+json',
				},
				...gotOptions,
			}) : got.extend(gotOptions);
	}

	get(path) {
		return this.request.get(path);
	}

	async fetchRepos(user, pageNumber = 1) {
		const { body: repos } = await this.get(`users/${user}/repos?per_page=100&page=${pageNumber}`);
		if (repos.length < 100) {
			return repos;
		}

		return array.concat(repos, await this.fetchRepos(user, ++pageNumber));
	}

	async viewCount(user, repo) {
		const { body: views } = await this.get(`repos/${user}/${repo}/traffic/views`);
		return views.count;
	}

	async cloneCount(user, repo) {
		const { body: clones } = await this.get(`repos/${user}/${repo}/traffic/clones`);
		return clones.count;
	}
}

const extractRepoInfo = repos => repos.map(repo => {
	return {
		name: repo.name,
		fork: repo.fork,
	};
});

const extractRepoStats = repos => repos.map(repo => {
	return {
		name: repo.name,
		stars: repo.stargazers_count,
		forks: repo.forks_count,
	};
});

/* TODO: collect further metrics
const issueCount = async (user, repo) => {
	const issues = await restGithub(`repos/${user}/${repo}/issues?per_page=100&state=all`)
	const total_issues = issues.length
    const open_issues = issues.filter(issue => issue.state === 'open').length
	const closed_issues = issues.filter(issue => issue.state === 'closed').length
	return {
		issues: total_issues,
        open_issues: open_issues,
		closed_issues: closed_issues
	}
}

const pullRequestCount = async(user, repo) => {
	const pulls = await restGithub(`repos/${user}/${repo}/pulls?per_page=100&state=all`)
	const total_pulls = pulls.length
	const open_pulls = pulls.filter(pull => pull.state === 'open').length
	const closed_pulls = pulls.filter(pull => pull.state === 'closed').length
	const merged_pulls = pulls.filter(pull => pull.merged).length
	return {
		pull_requests: total_pulls,
		open_pull_requests: open_pulls,
		closed_pull_requests: closed_pulls,
		merged_pull_requests: merged_pulls
	}
}

const commitCount = async (user, repo, pageNumber = 0) => {
	let commits = 0
	let flag = true
    while (flag) {
        const commitPage = (await restGithub(`repos/${user}/${repo}/commits?per_page=100&page=${++pageNumber}`)).length
		commits += commitPage
		if (commitPage < 100) flag = false
    }
    return commits
}
*/

const fetchUserRepos = async (user, token) => {
	const client = new RESTGitHubClient(token);
	const repos = await client.fetchRepos(user);
	return extractRepoInfo(repos);
};

const fetchUserEmails = async (user, token) => {
	const client = new RESTGitHubClient(token);
	const { body: emails } = await client.get('user/emails');
	return emails;
};

const fetchUserInstallations = async token => {
	const client = new RESTGitHubClient(token);
	const { body: installations } = await client.get('user/installations');
	return installations;
};

const fetchUserRepoStats = async id => {
	const { User } = require('../models');
	const user = await User.findByPk(id);

	const disabledMetricTypes = new Set(user.metricTypes
		.filter(metricType => metricType.disabled)
		.map(metricType => metricType.name));

	const client = new RESTGitHubClient(user.token);
	const userRepos = await client.fetchRepos(user.username);
	const stats = await extractRepoStats(userRepos);

	const repos = await Promise.all(stats
		.map(async repo => {
			try {
				if (!disabledMetricTypes.has('views')) {
					repo.views = await client.viewCount(user.username, repo.name);
				}

				if (!disabledMetricTypes.has('clones')) {
					repo.clones = await client.cloneCount(user.username, repo.name);
				}
			} catch {}

			return repo;
		}));

	return repos;
};

module.exports = {
	fetchUserRepos,
	fetchUserRepoStats,
	fetchUserEmails,
	fetchUserInstallations,
};
