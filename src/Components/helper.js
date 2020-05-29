import current_info from "../info";
import ordinal from "ordinal";
import {DUBLIN_CONSTITS} from "../utils/Constants";

export const getData = (dail_session=undefined) => {
	
	if (dail_session === undefined) {
		dail_session = current_info.dail
	}
	else {
		if (typeof document !== `undefined`) {
			document.title = document.title + " - " + ordinal(dail_session) +
				" Dáil";
		}
	}

	const info = require('../data/' + dail_session + 'info.json');
	const members = require('../data/' + dail_session +
		'members.json');
	return [info, members]
};

export const handleCheckedConstituency = (data, constit) => {
	let result = [];
	data.forEach(
		member => {
			if (member["constituency"].toLowerCase() === constit) {
				// console.log("constit: ", constit);
				// console.log("member[\"constituency\"]: ", member["constituency"].toLowerCase());
				result.push(member)
			}
		}
	);
	// console.log("result: ", result);
	return result;
};



export const handleCheckedDublin = (data) => {
	let result = [];
	data.forEach(
		member => {
			const memberConst = member["constituency"].toLowerCase()
			if (DUBLIN_CONSTITS.includes(memberConst)) {
				result.push(member)
			}
		}
	);
	return result;
};

export const camelCase = str => {
	let splitStr = str.toLowerCase().split(/[ -]+/);
	for (let i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	}
	return splitStr.join(' '); 
}
