import React from 'react';
import Card from "@material-ui/core/Card";
import {PropTypes} from 'prop-types';

class TDCard extends React.Component {

	constructor(props) {
		super(props);
	}


	render() {
		return (
			<Card id="content">
				<div id="cards">

					<img
						className={"member__avatar"}
						src="https://data.oireachtas.ie/ie/oireachtas/member/id/John-Brassil.D.2016-10-03/image/thumb"
						alt="Image of TD"
					/>
					<div className={"member__name"}>John Brassil</div>


				</div>
			</Card>
		);
	}
}


export default TDCard;