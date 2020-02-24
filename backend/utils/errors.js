const { NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = require('http-status');

class HTTPError extends Error {
	constructor(status = INTERNAL_SERVER_ERROR, message = 'Internal server error') {
		super(message);
		this.status = status;
	}

	toJSON() {
		return {
			status: this.status,
			errors: {
				message: this.message,
			},
		};
	}
}

const InternalServerError = new HTTPError();
const NotFoundError = new HTTPError(NOT_FOUND, 'Not found');
const UnauthorizedError = new HTTPError(
	UNAUTHORIZED,
	'Invalid authentication credentials',
);

module.exports = {
	HTTPError,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
};
