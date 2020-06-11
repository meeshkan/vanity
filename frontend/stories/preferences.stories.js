import React from 'react';
import { Preferences } from '../pages/preferences';

export default { title: 'Preferences' };

export const noRepos = () => (
	<Preferences
		isAppInstalled
		username='John'
		token='foo'
		updateRepos={() => {}}
		login={() => {}}
		metricTypes={[
			{ name: 'stars', selected: true, disabled: false },
			{ name: 'forks', selected: false, disabled: false },
			{ name: 'views', selected: true, disabled: false },
			{ name: 'clones', selected: true, disabled: false },
		]}
		repos={[]}
	/>
);

export const fewRepos = () => (
	<Preferences
		isAppInstalled
		username='Patricia'
		token='foo'
		updateRepos={() => {}}
		login={() => {}}
		metricTypes={[
			{ name: 'stars', selected: true, disabled: false },
			{ name: 'forks', selected: false, disabled: false },
			{ name: 'views', selected: true, disabled: false },
			{ name: 'clones', selected: true, disabled: false },
		]}
		repos={[
			{ name: 'repo-one', fork: false, selected: false },
			{ name: 'repo-two', fork: true, selected: false },
			{ name: 'repo-three', fork: false, selected: true }
		]}
	/>
);

export const manyRepos = () => (
	<Preferences
		username='Amy'
		token='foo'
		updateRepos={() => {}}
		login={() => {}}
		isAppInstalled={false}
		metricTypes={[
			{ name: 'stars', selected: true, disabled: false },
			{ name: 'forks', selected: true, disabled: false },
			{ name: 'views', selected: false, disabled: true },
			{ name: 'clones', selected: false, disabled: true },
		]}
		repos={[
			{ name: 'repo-one', fork: false, selected: false },
			{ name: 'repo-two', fork: true, selected: false },
			{ name: 'repo-three', fork: false, selected: true },
			{ name: 'ugh-this-is-long', fork: false, selected: true },
			{ name: 'why-didnt-i-write-a-loop', fork: false, selected: true },
			{ name: 'i-just-copied-and-pasted-these', fork: false, selected: true },
			{ name: 'and-now', fork: false, selected: true },
			{ name: 'i-have-to-write', fork: false, selected: true },
			{ name: 'creative-names', fork: false, selected: true },
			{ name: 'for-all-these', fork: false, selected: true },
			{ name: 'repos', fork: false, selected: true },
			{ name: 'oh-well', fork: false, selected: true },
			{ name: 'set-to-false', fork: false, selected: false },
			{ name: 'yet-another-repo', fork: false, selected: true },
			{ name: 'too-lazy', fork: false, selected: true },
			{ name: 'cannot-continue', fork: false, selected: true },
			{ name: 'but-must', fork: false, selected: true },
			{ name: 'please-end', fork: false, selected: false },
			{ name: 'seriously', fork: false, selected: false },
			{ name: 'enough', fork: false, selected: false },
			{ name: 'a-few-more-to-go', fork: false, selected: false },
			{ name: 'foo', fork: false, selected: false },
			{ name: 'bar', fork: false, selected: false },
			{ name: 'baz', fork: false, selected: false },
			{ name: 'what', fork: false, selected: true },
			{ name: 'one-more', fork: false, selected: true },
			{ name: 'ugggghhhhhhhhhh', fork: true, selected: false },
		]}
	/>
);
