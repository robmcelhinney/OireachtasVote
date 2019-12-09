import React from 'react';

const PartyValue = ({partyName, median}) => {
	return (
		<span>
			<div className={"median-value"}>
				{median}%
			</div>
			<div className={"median-name"}>
				{partyName}
			</div>
		</span>
	);
};

export default PartyValue;