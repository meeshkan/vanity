import { storiesOf } from '@storybook/html';
import moment from 'moment';
import sampleEmailTemplate from '../utils/email/templates/sample.ejs';
import weeklyEmailTemplate from '../utils/email/templates/weekly.ejs';
import SAMPLE_METRICS from '../test/__fixtures__/sample-metrics';
import WEEKLY_METRICS from '../test/__fixtures__/weekly-metrics';
import USER from '../test/__fixtures__/user';

storiesOf('Sample Email', module)
	.add('with repos', () => sampleEmailTemplate({
		user: USER,
		metrics: SAMPLE_METRICS,
	}))
	.add('with no repos', () => sampleEmailTemplate({
		user: USER,
		metrics: [],
	}));

storiesOf('Weekly Email', module)
	.add('with repos', () => weeklyEmailTemplate({
		user: USER,
		metrics: WEEKLY_METRICS,
		date: moment().format('LL'),
	}))
	.add('with no repos', () => weeklyEmailTemplate({
		user: USER,
		metrics: [],
		date: moment().format('LL'),
	}));
