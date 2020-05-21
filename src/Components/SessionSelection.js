import React from 'react';
import {Link} from 'react-router-dom'
import info from '../info.json';
import ordinal from "ordinal";
import Footer from "./Footer";


const SessionSelection = (props) => {

	const linkLists = () => {
		const dail_array = Array.from({length: info.dail}, (v, k) => k+1);
		return dail_array.map((n) => {
			return <li key={n}><Link to={"/session/" + n}>{ordinal(n)} Dáil </Link></li>;
		});
	};

	const noMatch = () => {
		if (props.dail_session !== undefined) {
			return <h3 className={"noMatch"}>No match for <code>{props.dail_session}</code></h3>;
		}
	};

	return (
		<>
			<div className={"maincontent container"}>
				<div className={"sessionHeader text-align-centre"}>
					{noMatch()}
					Check out other Dáil sessions below.
					<div>
					Most older Dáil sessions are missing data so they are not always correct.
					(Usually when a TD's name is recorded in English but their voting record uses their name as Gaeilge or they are recorded as John P. Murphy in the voting record instead of John Patrick Murphy.)
					</div>
				</div>
				<div className={"dail_session_ul"}>
					<ul className={"dail_session_list"}>
						{linkLists()}
					</ul>
				</div>
			</div>
			<Footer />
		</>
	)
};


export default SessionSelection;