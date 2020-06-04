const test = require('ava');
const { generateToken, verifyToken } = require('../../utils/token');

const JWT_REGEX = /^[\w-=]+\.[\w-=]+\.?[\w-.+/=]/;

test('generates tokens', t => {
	const token = generateToken({ foo: 'bar' });
	t.regex(token, JWT_REGEX);
});

test('verifies valid tokens', t => {
	const token = generateToken({ foo: 'bar' });
	t.is(verifyToken(token).foo, 'bar');

	const error = t.throws(() => verifyToken('this_isnt_a_valid_token'));
	t.is(error.message, 'jwt malformed');
});
