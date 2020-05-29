import React from 'react';

const PartyValue = ({partyName, median}) => {
	return (
		<span>
			<div className={"median-value"}>
				{median}%
			</div>
			<div className={"median-name text-align-centre"}>
				{partyName}
			</div>
		</span>
	);
};

export default PartyValue;
