import React from 'react';
import PartyValue from "./PartyValue";

const PartyValueList = ({ dict }) => {
	return (
		<div className={"flex-container"}>
			{
				Object.keys(dict).map((key) => (
					<PartyValue key={key} partyName={key}
								median={dict[key]} />
				))
			}
		</div>
	);
};

export default PartyValueList;
