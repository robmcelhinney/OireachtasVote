import React, {useEffect, useState} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import info from '../info.json';
import Select from 'react-select';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import wNumb from 'wnumb';

function filterCaseInsensitive(filter, row) {
	const id = filter.pivotId || filter.id;
	if (["party", "firstName", "lastName", "fullName"].includes(id)) {
		return (
			row[id] !== undefined ?
				String(row[id].toLowerCase()).includes(filter.value.toLowerCase())
						|| (String(row[id].toLowerCase()).normalize('NFD')
						.replace(/[\u0300-\u036f]/g, ""))
						.includes(filter.value.toLowerCase())
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

const Table = (props) => {
	const [percent, setPercent] = useState(
		[0, 100]
	);
	const [vote, setVote] = useState(
		[0, info['totalVotes']]
	);
	const [widthHide, setWidthHide] = useState(
		false
	);
	const [partyWidth, setPartyWidth] = useState(
		"250"
	);

	function handlePercentRange(event, onChange) {
		setPercent([event[0], event[1]]);
		onChange(event)
	}
	function handleVoteRange(event, onChange) {
		setVote([event[0], event[1]]);
		onChange(event)
	}

	const party_options = info['parties'];

	useEffect(() => {
		const resize = () => {
			let smallerWidth = (window.innerWidth <= 768);
			if (smallerWidth !== widthHide) {
				setWidthHide(smallerWidth);
			}
			if (widthHide) {
				setPartyWidth("100");
			}
		};

		window.addEventListener("resize", resize);

		return () => {
			window.removeEventListener("resize", resize);
		};
	});

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
			return (vote[0] <= Number(row[id])
				&& vote[1] >= Number(row[id]))
		},

		Filter: ({ filter, onChange }) =>
			<div className={"nouislider_div"} >
				<Nouislider
					className={"nouislider"}
					range={{ min: 0, max: info['totalVotes'] }}
					start={vote}
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
		maxWidth: "150",
	};

	const lastNameColumn = {
		Header: "Last Name",
		accessor: "lastName",
		maxWidth: "150",
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
				return (percent[0] <= Number(row[id])
					&& percent[1] >= Number(row[id]))
			},

			Filter: ({ filter, onChange }) =>
				<div className={"nouislider_div"}>
					<Nouislider
						className={"nouislider"}
						range={{ min: 0, max: 100 }}
						start={percent}
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

	return (
		<ReactTable
			data={props.members}
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
			pageSizeOptions={[5, 10, 15, 20, 50, 100, props.members.length]}
		/>
	);
};

export default Table;
