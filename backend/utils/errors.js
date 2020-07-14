const { NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED } = require('http-status');

class HTTPError extends Error {
	constructor(status = INTERNAL_SERVER_ERROR, message = 'Internal server error') {
		super(message);
		this.status = status;
	}

	toJSON() {
		return {
			status: this.status,
			error: {
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
const UnsubscriptionError = message => new HTTPError(
	UNAUTHORIZED,
	message,
);
const ResubscriptionError = message => new HTTPError(
	UNAUTHORIZED,
	message,
);
const DeletionError = message => new HTTPError(
	UNAUTHORIZED,
	message,
);

module.exports = {
	HTTPError,
	InternalServerError,
	NotFoundError,
	UnauthorizedError,
	UnsubscriptionError,
	ResubscriptionError,
	DeletionError,
};
