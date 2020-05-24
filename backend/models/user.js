const { NODE_ENV } = require('../config');

module.exports = (Sequelize, DataTypes) => {
	const User = Sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				is: /^[a-z0-9_-]+$/i,
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
			allowNull: NODE_ENV === 'test',
			unique: true,
			validate: {
				is: /^[a-z0-9]+$/i,
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

	return User;
};
