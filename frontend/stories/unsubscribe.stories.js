import React from 'react';
import { Unsubscribe } from '../pages/unsubscribe';

export default { title: 'Unsubscribe' };

export const successfulUnsubscription = () => (
	<Unsubscribe
		email="foo@bar.com"
		message={undefined}
	/>
);

export const unsuccessfulUnsubscription = () => (
	<Unsubscribe
		email={undefined}
		message="Unsubscription token is invalid"
	/>
);
