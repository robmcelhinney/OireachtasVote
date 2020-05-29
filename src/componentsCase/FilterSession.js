import React from 'react';
import 'react-table/react-table.css';
import current_info from '../info.json';
import MainPage from "./MainPage";
import SessionSelection from "./SessionSelection";


class Session extends React.Component {
	render() {
		let dail_session = (this.props.location.pathname)
				.replace("/session/", "")
		if (dail_session === "/session" || dail_session === "") {
			console.log("dail_session undefined ")
			dail_session = undefined
		}
		return (
			this.returnValidSession(dail_session)
		);
	}

	returnValidSession = (dail_session) => {
		const dail_array = Array.from({length: current_info.dail},
			(v, k) => k+1);

		if (!dail_array.includes(Number(dail_session))){
			return <SessionSelection dail_session={dail_session}/>
		}
		return <MainPage session={Number(dail_session)}/>
	}
}

export default Session;
