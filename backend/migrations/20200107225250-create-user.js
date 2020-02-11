'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Users', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
				validate: {
					isEmail: true,
				},
			},
			token: {
				type: Sequelize.STRING,
				allowNull: true,
				unique: true,
			},
			admin: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			avatar: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			repos: {
				type: Sequelize.JSON,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},
	down: (queryInterface, _) => {
		return queryInterface.dropTable('Users');
	},
};
