import { NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'http-status';

export class HTTPError extends Error {
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

export const InternalServerError = new HTTPError();
export const NotFoundError = new HTTPError(NOT_FOUND, 'Not found');
export const UnauthorizedError = new HTTPError(
	UNAUTHORIZED,
	'Invalid authentication credentials',
);