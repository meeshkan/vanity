import React from 'react';
import { Preferences } from '../pages/preferences';

export default { title: 'Preferences' };

export const fewRepos = () => (
	<Preferences
		username='Patricia'
		token='foo'
		updateRepos={() => {}}
		login={() => {}}
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
			{ name: 'is', fork: true, selected: false },
			{ name: 'enough', fork: false, selected: true },
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
