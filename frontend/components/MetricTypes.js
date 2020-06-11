import React from 'react';
import Toggle from 'react-toggle';
import PropTypes from 'prop-types';
import { updateMetricTypes } from '../logic/preferences';

const MetricType = ({ metric, index, handleToggle }) => (
	<tr key={metric.name}>
		<th className='fw3 bb b--white-20 tl pb3 pr6 pv3'>
			{metric.name}
		</th>
		<th className='bb b--white-20 tr pb3 pv3'>
			<Toggle
				defaultChecked={metric.selected}
				disabled={metric.disabled}
				icons={false}
				onChange={event => handleToggle(event, index)}
			/>
		</th>
	</tr>
);

MetricType.propTypes = {
	metric: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	handleToggle: PropTypes.func.isRequired,
};

const MetricTypes = ({ metricTypes, token }) => {
	const handleToggle = (event, index) => {
		metricTypes[index].selected = event.target.checked;
		updateMetricTypes(token, metricTypes);
	};

	return (
		<>
			<p className='f5 f4-ns lh-copy'>choose the types of metrics you want to receive for each repo:</p>
			<div className='overflow-auto'>
				<table className='f5 center' cellSpacing='0'>
					<tbody className='lh-copy'>
						{metricTypes.map((metric, index) => (
							<MetricType
								key={metric.name}
								metric={metric}
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

MetricTypes.propTypes = {
	metricTypes: PropTypes.array.isRequired,
	token: PropTypes.string.isRequired,
};

export default MetricTypes;
