import React, {useEffect, useState} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import members from '../members.json';
import info from '../info.json';
import Select from 'react-select';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import wNumb from 'wnumb';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';

function filterCaseInsensitive(filter, row) {
	const id = filter.pivotId || filter.id;
	if (["party", "firstName", "lastName", "fullName"].includes(id)) {
		return (
			row[id] !== undefined ?
				String(row[id].toLowerCase()).includes(filter.value.toLowerCase())
				: true
		);
	}
	else if (["votes", "percent"].includes(id)) {
		return (
			row[id] !== undefined ?
				String(row[id]).includes(filter.value)
				: true
		);
	}
}

let data = members;

const App = () => {
	const [percentLower, setPercentLower] = useState(
		0
	);
	const [percentHigher, setPercentHigher] = useState(
		100
	);
	const [voteLower, setVoteLower] = useState(
		0
	);
	const [voteHigher, setVoteHigher] = useState(
		info['totalVotes']
	);
	const [widthHide, setWidthHide] = useState(
		false
	);
	// const [excludeCeannComhairle, setExcludeCeannComhairle] = useState(
	// 	false
	// );
	const [excludeTDs, setExcludeTDs] = useState(
		false
	);

	function handlePercentRange(event, onChange) {
		setPercentLower([event[0]]);
		setPercentHigher([event[1]]);
		onChange(event)
	}
	function handleVoteRange(event, onChange) {
		setVoteLower([event[0]]);
		setVoteHigher([event[1]]);
		onChange(event)
	}

	const party_options = info['parties'];

	const resize = () => {
		let smallerWidth = (window.innerWidth <= 768);
		if (smallerWidth !== widthHide) {
			setWidthHide(smallerWidth);
		}
		if (widthHide) {
			partyWidth = "100";
			nameWidth = "100";
		}
	};

	useEffect(() => {
		window.addEventListener("resize", resize);
		// console.log("data 1: ", data);
		// console.log("excludeTDs: ", excludeTDs);
		if (excludeTDs) {
			data = [];
			members.forEach(
				member => {
					if (!member["office"]) {
						data.push(member)
					}}
			);
		}
		else {
			data = members;
		}
		// console.log("data 2: ", data);
		return () => {
			window.removeEventListener("resize", resize);
		};
	}, [resize]);

	let partyWidth = "250";
	let nameWidth = "150";

	const pictureColumn = {
		id: "picture",
		accessor: d => {
			return <div><a href={"https://www.oireachtas.ie/en/members/member/"
			+ d.member_id}><img alt={"td"}
								className={"member__avatar"}
								src={"https://data.oireachtas.ie/ie/oireachtas/member/id/"
								+ d.member_id + "/image/thumb"}/></a></div>
		},
		filterable: false,
		maxWidth: "100",
	};

	const voteColumn = {
		id: "Votes",
		Header: "Votes",
		accessor: "votes",
		maxWidth: "150",
		filterMethod: (filter, row) => {
			const id = filter.pivotId || filter.id;
			return (voteLower <= Number(row[id])
				&& voteHigher >= Number(row[id]))
		},

		Filter: ({ filter, onChange }) =>
			<div className={"nouislider_div"} >
				<Nouislider
					className={"nouislider"}
					range={{ min: 0, max: info['totalVotes'] }}
					start={[voteLower, voteHigher]}
					connect={true}
					step={10}
					value={filter ? filter.value : 'all'}
					style={{width:'70%', marginLeft:'15%'}}

					onChange={event => handleVoteRange(event, onChange)}
					tooltips={[ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ]}
				/></div>,
	};

	const fullNameColumn = {
		Header: "Full Name",
		id: "fullName",
		accessor: d => {
			return d.firstName + " " + d.lastName
		},
		maxWidth: "150",
	};

	const firstNameColumn = {
		Header: "First Name",
		accessor: "firstName",
		maxWidth: nameWidth,
	};

	const lastNameColumn = {
		Header: "Last Name",
		accessor: "lastName",
		maxWidth: nameWidth,
	};

	const columns = [
		{
			Header: "Party",
			accessor: "party",
			maxWidth: partyWidth,
			filterMethod: (filter, row) => {
				const id = filter.pivotId || filter.id;
				if (filter['value'] && filter['value'].length !== 0) {
					let parties = [];
					filter['value'].forEach(
						element =>
							parties.push(element.label)
					);
					return (parties.includes(String(row[id])))
				}
				return true;
			},
			Filter: ({ filter, onChange }) => {
				return (
					<Select
						defaultValue={[]}
						isMulti
						name="colors"
						options={party_options}
						className="basic-multi-select"
						classNamePrefix="select"
						menuPortalTarget={document.body}
						onChange={event => onChange(event)}
						value={filter ? filter.value : 'all'}
					/>
				);
			}
		},
		{
			Header: "Percent",
			id: "Percent",
			accessor: d => {
				return d.percentVotes
			},
			filterMethod: (filter, row) => {
				const id = filter.pivotId || filter.id;
				return (percentLower <= Number(row[id])
					&& percentHigher >= Number(row[id]))
			},

			Filter: ({ filter, onChange }) =>
				<div className={"nouislider_div"}>
					<Nouislider
						className={"nouislider"}
						range={{ min: 0, max: 100 }}
						start={[percentLower, percentHigher]}
						connect={true}
						step={1}
						value={filter ? filter.value : 'all'}
						style={{width:'90%'}}
						onChange={event => handlePercentRange(event, onChange)}
						pips={{
							mode: "count",
							values: 2,
						}}
						tooltips={[ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ]}
					/></div>,
		},
	];

	if (window.innerWidth <= 768) {
		columns.unshift({
			Header: "Name",
			columns: [
				fullNameColumn
			]
		});
	}
	else {
		columns.unshift({
			Header: "Name",
			columns: [
				firstNameColumn,
				lastNameColumn
			]
		});
		columns.unshift(pictureColumn);
		columns.push(voteColumn);
	}

	// const handleCCChecked = () => {
	// 	setExcludeCeannComhairle(!excludeCeannComhairle)
	// };
	const handleTDsChecked = () => {
		setExcludeTDs(!excludeTDs)
	};

	return (
		<div id={"maincontent"} className={"container"}>
			<div id={"headerInfo"}>
				<h1 className={"mainHeader"}>TD Voting Record - {info.currentDail}</h1>
				<p>info <span id={"should_be"}>**should be**</span> accurate as of {info.dateCreated}</p>
				<FormGroup row>
					{/*<FormControlLabel*/}
						{/*control={*/}
							{/*<Checkbox checked={excludeCeannComhairle} onChange={handleCCChecked} value={excludeCeannComhairle} />*/}
						{/*}*/}
						{/*label="Exclude Ceann Comhairle"*/}
					{/*/>*/}
					<FormControlLabel
						control={
							<Checkbox checked={excludeTDs} onChange={handleTDsChecked} value={excludeTDs} />
						}
						label="Exclude TDs & Taoiseach"
					/>
				</FormGroup>
			</div>
			<ReactTable
				data={data}
				columns={columns}
				filterable
				className="-striped -highlight"
				defaultSortDesc={true}
				defaultSorted={[{
					id: 'Percent',
					desc: false
				}]}
				defaultFilterMethod={(filter, row) => filterCaseInsensitive(filter, row)}
				defaultPageSize={15}
				pageSizeOptions={[5, 10, 15, 20, 50, 100]}
			/>
		</div>
	);
};

export default App;
