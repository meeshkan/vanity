const GA_TRACKING_ID = 'UA-107981669-9';

const pageview = url => {
	window.gtag('config', GA_TRACKING_ID, {
		page_location: url,
	});
};

const event = ({ action, category, label, value }) => {
	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value,
	});
};

module.exports = {
	GA_TRACKING_ID,
	pageview,
	event,
};
