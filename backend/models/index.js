const { join } = require('path');
const Sequelize = require('sequelize');
const { SEQUELIZE_CONFIG, NODE_ENV } = require('../config');

const db = {};
const env = NODE_ENV || 'development';
const config = SEQUELIZE_CONFIG[env];

const ORM = new Sequelize(
	config.database,
	config.username,
	config.password,
	config
);

ORM.sync({
	force: NODE_ENV === 'test',
});

db.User = ORM.import(join(__dirname, 'user.js'));
db.Snapshot = ORM.import(join(__dirname, 'snapshot.js'));

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.ORM = ORM;
db.sequelize = Sequelize;

module.exports = db;
