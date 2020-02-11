module.exports = (Sequelize, DataTypes) => {
	const Snapshot = Sequelize.define('Snapshot', {
		metrics: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	});

	Snapshot.associate = models => {
		Snapshot.belongsTo(models.User, {
			foreignKey: 'userId',
			as: 'user',
			onDelete: 'CASCADE',
		});
	};

	return Snapshot;
};
