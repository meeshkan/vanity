const got = require('got');
const array = require('lodash/array');
const { User } = require('../models');

let gitGot;

const extendGot = token => token ?
	got.extend({
		prefixUrl: 'https://api.github.com/',
		headers: {
			authorization: `token ${token}`,
			accept: 'application/vnd.github.machine-man-preview+json',
		},
		responseType: 'json',
	}) : got.extend({
		prefixUrl: 'https://api.github.com/',
		responseType: 'json',
	});

const restGithub = path => gitGot.get(path);

const fetchRepos = async (user, pageNumber = 1) => {
	const { body: repos } = await restGithub(`users/${user}/repos?per_page=100&page=${pageNumber}`);
	if (repos.length < 100) {
		return repos;
	}

	return array.concat(repos, await fetchRepos(user, ++pageNumber));
};

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

const viewCount = async (user, repo) => {
	const { body: views } = await restGithub(`repos/${user}/${repo}/traffic/views`);
	return views.count;
};

const cloneCount = async (user, repo) => {
	const { body: clones } = await restGithub(`repos/${user}/${repo}/traffic/clones`);
	return clones.count;
};

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
	gitGot = extendGot(token);
	const repos = await fetchRepos(user);
	return extractRepoInfo(repos);
};

const fetchUserEmails = async (user, token) => {
	gitGot = extendGot(token);
	const { body: emails } = await restGithub('user/emails');
	return emails;
};

const fetchUserInstallations = async token => {
	gitGot = extendGot(token);
	const { body: installations } = await restGithub('user/installations');
	return installations;
};

const fetchUserRepoStats = async id => {
	const userByID = await User.findByPk(id);
	const user = userByID.get({ plain: true });
	const selectedMetricTypes = user.metricTypes
		.filter(metricType => metricType.selected)
		.map(metricType => metricType.name);

	gitGot = extendGot(user.token);
	const userRepos = await fetchRepos(user.username);
	const stats = await extractRepoStats(userRepos);

	const repos = await Promise.all(stats
		.map(repo => {
			Object.keys(repo).forEach(key => {
				if (!selectedMetricTypes.includes(key) && key !== 'name') {
					delete stats[key];
				}
			});

			return repo;
		})
		.map(async repo => {
			try {
				if (selectedMetricTypes.includes('views')) {
					repo.views = await viewCount(user.username, repo.name);
				}

				if (selectedMetricTypes.includes('clones')) {
					repo.clones = await cloneCount(user.username, repo.name);
				}

				return repo;
			} catch (_) {
				return repo;
			}
		})
	);

	return repos;
};

module.exports = {
	fetchUserRepos,
	fetchUserRepoStats,
	fetchUserEmails,
	fetchUserInstallations,
};
