'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.addColumn('Users', 'metricTypes', {
					type: Sequelize.JSON,
					allowNull: true,
				}, { transaction: t })
			]);
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(t => {
			return Promise.all([
				queryInterface.removeColumn('Users', 'metricTypes', { transaction: t })
			]);
		});
	}
};
