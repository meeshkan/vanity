const test = require('ava');
const { generateToken, verifyToken } = require('../../utils/token');

const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]/;

test('generates tokens', t => {
	const token = generateToken({ foo: 'bar' });
	t.regex(token, jwtRegex);
});

test('verifies valid tokens', t => {
	const token = generateToken({ foo: 'bar' });
	t.is(verifyToken(token).foo, 'bar');

	const error = t.throws(() => verifyToken('this_isnt_a_valid_token'));
	t.is(error.message, 'jwt malformed');
});
