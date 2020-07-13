const _ = require('lodash');
const { verifyToken } = require('../utils/token');

const containSameElements = (x, y) => _.isEqual(_.sortBy(x), _.sortBy(y));
const getPrimaryEmail = emails => emails.filter(email => email.primary)[0].email; // TODO: ask user which email he/she prefers to use

const DEFAULT_USER_METRIC_TYPES = [
	{ name: 'stars', selected: true, disabled: false },
	{ name: 'forks', selected: true, disabled: false },
	{ name: 'views', selected: false, disabled: true },
	{ name: 'clones', selected: false, disabled: true },
];

module.exports = (Sequelize, DataTypes) => {
	const { UserScheduler } = require('./user-scheduler');
	const { fetchUserRepos, fetchUserEmails } = require('../utils/github');
	const { getRepeatableJobsByID } = require('../workers/helpers');
	const User = Sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				is: /^[\w-]+$/i,
			},
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isEmail: true,
			},
		},
		token: {
			type: DataTypes.STRING,
			unique: true,
			validate: {
				is: /^[a-z\d]+$/i,
			},
		},
		admin: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			unique: false,
			defaultValue: false,
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		repos: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		metricTypes: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	});

	User.associate = models => {
		User.hasMany(models.Snapshot, {
			foreignKey: 'userId',
			as: 'snapshots',
			onDelete: 'CASCADE',
		});
	};

	User.beforeCreate((user, options) => {
		let UserSchedulerClass = options.userSchedulerClass;

		if (!UserSchedulerClass) {
			UserSchedulerClass = UserScheduler;
		}

		user.userScheduler = new UserSchedulerClass();
	});

	User.afterCreate(async user => {
		user = await user.updateFromGitHub();
		user.userScheduler.scheduleForUser(user);
	});

	User.findByUsername = username => {
		return User.findOne({ where: { username }});
	};

	User.findByToken = async token => {
		const { id } = await verifyToken(token);
		return User.findByPk(id);
	};

	User.findByRequest = request => {
		const auth = request.headers.authorization;
		const { token } = JSON.parse(auth);
		return User.findByToken(token);
	};

	User.afterDestroy(async user => {
		const jobs = await getRepeatableJobsByID(user.id);
		const jobsToDelete = Object.values(jobs);
		_.compact(jobsToDelete).forEach(job => job.remove());
	});

	User.prototype.updateFromGitHub = async function () {
		const emails = await fetchUserEmails(this.username, this.token);
		this.email = getPrimaryEmail(emails);

		if (!this.metricTypes) {
			this.metricTypes = DEFAULT_USER_METRIC_TYPES;
		}

		let latestRepos = await fetchUserRepos(this.username, this.token);
		if (!(this.repos && containSameElements(latestRepos.map(repo => repo.name), this.repos.map(repo => repo.name)))) {
			latestRepos = latestRepos.map(repo => {
				repo.selected = !repo.fork;
				return repo;
			});

			if (this.repos === null) {
				this.repos = latestRepos;
			} else {
				latestRepos.forEach(repo => {
					if (!this.repos.map(repo => repo.name).includes(repo.name)) {
						this.repos.push(repo);
					}
				});
			}
		}

		return this.save();
	};

	return User;
};
