import React from 'react';
import Toggle from 'react-toggle';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { updateRepos } from '../logic/preferences';

const Repo = ({ repo, index, handleToggle }) => (
	<tr key={repo.name}>
		<th className="fw3 bb b--white-20 tl pb3 pr5 pv3">
			{repo.name}
			{repo.fork && (
				<>
					<i
						className="material-icons md-18 light-blue"
						data-tip="repo is a fork"
					>
						call_split
					</i>
					<ReactTooltip
						effect="solid"
						place="right"
						type="light"
					/>
				</>
			)}
		</th>
		<th className="bb b--white-20 tr pb3 pv3">
			<Toggle
				defaultChecked={repo.selected}
				icons={false}
				onChange={event => handleToggle(event, index)}
			/>
		</th>
	</tr>
);

Repo.propTypes = {
	repo: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	handleToggle: PropTypes.func.isRequired,
};

const Repos = ({ repos, token }) => {
	const handleToggle = (event, index) => {
		repos[index].selected = event.target.checked;
		updateRepos(token, repos);
	};

	return (
		<>
			<p className="f5 f4-ns lh-copy">choose the repos you want to receive metrics for:</p>
			<div className="overflow-auto">
				<table className="f5 center" cellSpacing="0">
					<tbody className="lh-copy">
						{repos.map((repo, index) => (
							<Repo
								key={repo.name}
								repo={repo}
								index={index}
								handleToggle={handleToggle}
							/>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

Repos.propTypes = {
	repos: PropTypes.array.isRequired,
	token: PropTypes.string.isRequired,
};

export default Repos;
