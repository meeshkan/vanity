const { join } = require('path');
const Sequelize = require('sequelize');

const db = {};
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/sequelize.js`)[env];

const ORM = new Sequelize(
	config.database,
	config.username,
	config.password,
	config
);

/* TODO: remove
if (env === 'development') {
    ORM.sync({ force: true });
}
*/

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
