const MailGen = require('mailgen');
const SGMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, EMAIL_CONFIG } = require('../config');

const mailGenerator = new MailGen(EMAIL_CONFIG.mailgen);

const parseMetrics = metrics => {
	return metrics.map(repo => {
		const repoName = repo.name;
		delete repo.name;
		const parsedData = Object.keys(repo).map(key => {
			const metric = repo[key];
			const value = (metric.latest && metric.difference) ?
				`${metric.latest} +${metric.difference}` : `${metric}`;
			return {
				statistic: key,
				value,
			};
		});
		return {
			title: repoName,
			data: parsedData,
			columns: EMAIL_CONFIG.columnStyle,
		};
	});
};

const constructMailBody = (metrics, username, intro) => {
	const email = {
		body: {
			name: username,
			intro,
			table: parseMetrics(metrics),
		},
	};
	const emailBody = mailGenerator.generate(email);
	return emailBody;
};

const sendEmail = async email => {
	try {
		SGMail.setApiKey(SENDGRID_API_KEY);
		return await SGMail.send(email);
	} catch (error) {
		throw new Error(error.message);
	}
};

const containsComparisonMetrics = metric => metric.latest && metric.difference;

const send = async (metrics, user) => {
	const intro = (metrics.every(containsComparisonMetrics)) ?
		EMAIL_CONFIG.intro : EMAIL_CONFIG.sampleIntro;
	const body = await constructMailBody(metrics, user.username, intro);
	const email = {
		to: user.email,
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.subject,
		html: body,
	};
	return sendEmail(email);
};

const sendSample = async (metrics, user) => {
	const body = await constructMailBody(metrics, user.username, EMAIL_CONFIG.sampleIntro);
	// TEST: require('fs').writeFileSync('preview.html', emailBody, 'utf8');
	const email = {
		to: user.email,
		from: EMAIL_CONFIG.vanityAddress,
		subject: EMAIL_CONFIG.sampleSubject,
		html: body,
	};
	return sendEmail(email);
};

/* TEST:
const data = '{"metrics":[{"name":"active-onions","stars":3,"forks":1,"watchers":3},{"name":"binary-cli","stars":4,"forks":3,"watchers":4},{"name":"bitcoincash-regex","stars":4,"forks":0,"watchers":4},{"name":"btc-balance.now","stars":2,"forks":2,"watchers":2},{"name":"caesar-cli","stars":11,"forks":1,"watchers":11},{"name":"cf-detect.now","stars":3,"forks":1,"watchers":3},{"name":"cloudflare-detect","stars":11,"forks":3,"watchers":11},{"name":"cryptaddress-validator","stars":70,"forks":6,"watchers":70},{"name":"cryptaddress.now","stars":14,"forks":3,"watchers":14},{"name":"cryptocurrency-address-detector","stars":22,"forks":2,"watchers":22},{"name":"dash-regex","stars":3,"forks":0,"watchers":3},{"name":"dcipher","stars":86,"forks":22,"watchers":86},{"name":"dcipher-cli","stars":163,"forks":21,"watchers":163},{"name":"dogecoin-regex","stars":3,"forks":0,"watchers":3},{"name":"donations","stars":51,"forks":18,"watchers":51},{"name":"dymerge","stars":154,"forks":40,"watchers":154},{"name":"esolangs","stars":6,"forks":0,"watchers":6},{"name":"esolangs-cli","stars":0,"forks":1,"watchers":0},{"name":"ethereum-regex","stars":11,"forks":0,"watchers":11},{"name":"ghost-detect","stars":4,"forks":1,"watchers":4},{"name":"ghost-detect.now","stars":2,"forks":2,"watchers":2},{"name":"ghost-version","stars":2,"forks":0,"watchers":2},{"name":"hash-detector","stars":7,"forks":3,"watchers":7},{"name":"hash-detector-cli","stars":5,"forks":3,"watchers":5},{"name":"hash-length-regex","stars":3,"forks":1,"watchers":3},{"name":"hex-cli","stars":6,"forks":3,"watchers":6},{"name":"instaprof-site","stars":3,"forks":1,"watchers":3},{"name":"isitup.now","stars":12,"forks":3,"watchers":12},{"name":"kickthemout","stars":1609,"forks":369,"watchers":1609},{"name":"lexis-cli","stars":3,"forks":0,"watchers":3},{"name":"lexis-count","stars":2,"forks":1,"watchers":2},{"name":"lexis.now","stars":2,"forks":2,"watchers":2},{"name":"litecoin-regex","stars":4,"forks":1,"watchers":4},{"name":"md5-regex","stars":4,"forks":1,"watchers":4},{"name":"monero-regex","stars":5,"forks":0,"watchers":5},{"name":"movies-for-hackers","stars":7920,"forks":732,"watchers":7920},{"name":"neo-regex","stars":2,"forks":0,"watchers":2},{"name":"nephthys","stars":7,"forks":0,"watchers":7},{"name":"now-name","stars":0,"forks":0,"watchers":0},{"name":"now-name-cli","stars":0,"forks":0,"watchers":0},{"name":"onioff","stars":383,"forks":98,"watchers":383},{"name":"onion-regex","stars":8,"forks":4,"watchers":8},{"name":"open-anyway","stars":5,"forks":0,"watchers":5},{"name":"open-anyway-cli","stars":4,"forks":0,"watchers":4},{"name":"ripemd-regex","stars":2,"forks":0,"watchers":2},{"name":"ripple-regex","stars":3,"forks":0,"watchers":3},{"name":"sha-regex","stars":4,"forks":1,"watchers":4},{"name":"terminals-are-sexy","stars":8769,"forks":474,"watchers":8769},{"name":"tor-detect","stars":12,"forks":3,"watchers":12},{"name":"tor-detect.now","stars":5,"forks":3,"watchers":5},{"name":"url-cli","stars":3,"forks":4,"watchers":3}],"user":{"id":1,"email":"nikolaskam@gmail.com","username":"k4m4","selectedRepos":["active-onions","binary-cli","bitcoincash-regex","btc-balance.now","caesar-cli","cf-detect.now","cloudflare-detect","cryptaddress-validator","cryptaddress.now","cryptocurrency-address-detector","dash-regex","dcipher","dcipher-cli","dogecoin-regex","donations","dymerge","esolangs","esolangs-cli","ethereum-regex","ghost-detect","ghost-detect.now","ghost-version","hash-detector","hash-detector-cli","hash-length-regex","hex-cli","instaprof-site","isitup.now","kickthemout","lexis-cli","lexis-count","lexis.now","litecoin-regex","md5-regex","monero-regex","movies-for-hackers","neo-regex","nephthys","now-name","now-name-cli","onioff","onion-regex","open-anyway","open-anyway-cli","ripemd-regex","ripple-regex","sha-regex","terminals-are-sexy","tor-detect","tor-detect.now","url-cli"]}}';
(async () => {
    const parsedData = JSON.parse(data);
    sendSample(parsedData.metrics, parsedData.user);
})();
*/

module.exports = {
	send,
	sendSample,
};
