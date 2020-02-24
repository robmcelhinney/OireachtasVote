import React, {useEffect, useState} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";
import wNumb from 'wnumb';
import InputNumber from 'rc-input-number';
import Tooltip from '@material-ui/core/Tooltip';

function filterCaseInsensitive(filter, row) {
	const id = filter.pivotId || filter.id;

	function filterLowerCaseNormalize(str) {
		return (
			str !== undefined ?
				String(str.toLowerCase()).includes(filter.value.toLowerCase())
				|| (String(str.toLowerCase()).normalize('NFD')
					.replace(/[\u0300-\u036f]/g, ""))
					.includes(filter.value.toLowerCase())
				: true
		);
	}

	if (["party", "lastName", "constituency"].includes(id)) {
		return filterLowerCaseNormalize(row[id]);
	}
	else if (["firstName", "fullName"].includes(id)) {
		let rowValue = row[id];
		if (typeof(rowValue) === "object") {
			let child = row[id].props.children.props.children;
			rowValue = child[0] + " " + child[2];
		}
		return filterLowerCaseNormalize(rowValue);
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
		[0, props.info['totalVotes']]
	);
	const [widthHide, setWidthHide] = useState(
		false
	);
	const [partyWidth, setPartyWidth] = useState(
		"175"
	);

	const handlePercentRange = (event, onChange) => {
		setPercent([event[0], event[1]]);
		onChange(event)
	};

	const handleVoteRange = (event, onChange) => {
		setVote([event[0], event[1]]);
		onChange(event)
	};

	const party_options = props.info['parties'];

	useEffect(() => {
		const resize = () => {
			let smallerWidth = (window.innerWidth <= 768);
			if (smallerWidth !== widthHide) {
				setWidthHide(smallerWidth);
			}
			if (widthHide) {
				smallTable();
				setPartyWidth("100");
			}
			else {
				standardTable();
			}
		};

		window.addEventListener("resize", resize);

		return () => {
			window.removeEventListener("resize", resize);
		};
	});

	const fallbackDefaultImage = (ev) => {
		ev.target.src = require('../icons/user.svg')
	};

	const pictureColumn = {
		id: "picture",
		accessor: d => {
			return <div>
				<a href={"https://www.oireachtas.ie/en/members/member/"
					+ d.member_id}>
				<img alt={"td"}
						className={"member__avatar"}
						src={"https://data.oireachtas.ie/ie/oireachtas/member/id/"
						+ d.member_id + "/image/thumb"}
						onError={event => fallbackDefaultImage(event)}
				/>
				</a>
			</div>
		},
		filterable: false,
		maxWidth: 80,
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
				{props.info['totalVotes'] !== 0 &&
				<Nouislider
					className={"nouislider"}
					range={{ min: 0, max: props.info['totalVotes'] }}
					start={vote}
					connect={true}
					step={10}
					value={filter ? filter.value : 'all'}
					style={{width:'70%', marginLeft:'15%'}}

					onChange={event => handleVoteRange(event, onChange)}
					tooltips={[ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ]}
				/>
				}
			</div>,
	};

	const getNewTDTooltip = (total_votes, firstName, secondName="") => {
		return <Tooltip
			title={"TD during " + total_votes
			+ " votes."} enterDelay={300}
			leaveDelay={100} placement={"top"}
		>
			<span>
				{firstName}* {secondName}
			</span>
		</Tooltip>;
	};

	const fullNameColumn = {
		Header: "Full Name",
		id: "fullName",
		accessor: d => {
			if (d.total_votes === null) {
				return d.firstName + " " + d.lastName
			}
			else {
				return (
					getNewTDTooltip(d.total_votes, d.firstName, d.lastName)
				)
			}
		},
		maxWidth: "150",
	};

	const firstNameColumn = {
		Header: "First Name",
		id: "firstName",
		accessor: d => {
			if (d.total_votes === null) {
				return d.firstName
			}
			else {
				return (
					getNewTDTooltip(d.total_votes, d.firstName)
				)
			}
		},
		maxWidth: "120",
	};

	const lastNameColumn = {
		Header: "Last Name",
		accessor: "lastName",
		maxWidth: "120",
	};

	const constituencyColumn = {
		Header: "Constituency",
		accessor: "constituency",
		maxWidth: "100",
	};

	const percentColumnSlider = {
		Header: "Percent",
		id: "Percent",
		accessor: d => {
			return d.percentVotes
		},
		filterMethod: (filter, row) => {
			const id = filter.id;
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
					value={filter ? filter.value : ''}
					onChange={event => handlePercentRange(event, onChange)}
					pips={{
						mode: "count",
						values: 2,
					}}
					tooltips={[ wNumb({ decimals: 0 }), wNumb({ decimals: 0 }) ]}
				/>
			</div>,
	};

	const percentColumnOptions = {
		Header: "Percent",
		id: "Percent",
		accessor: d => {
			return d.percentVotes
		},

		filterMethod: (filter, row) => {
			const id = filter.id;
			if (filter.value[1] === "one") {
				const value = (isNaN(filter.value[0])) ? 0 : filter.value[0];
				return value <= Number(row[id])
					&& percent[1] >= Number(row[id])
			}
			const value = (isNaN(filter.value[0])) ? 100 : filter.value[0];
			return percent[0] <= Number(row[id])
				&& value >= Number(row[id])
		},
		Filter: ({ filter, onChange }) =>
			<div>
				<InputNumber className={"numberInput"}
					value={percent[0]}
					min={0} max={100}
					onChange={e => {
					onChange([(isNaN(e)) ? 0 : e, "one"])
					}}
					onBlur={event => {
					 let value = Number(event.target.value);
					 if (isNaN(value)) {
						value = 0;
					 }
					 setPercent([value, percent[1]])
					}}
				/>
				<InputNumber className={"numberInput"}
					value={percent[1]}
					min={0} max={100}
					onChange={e => {
					 onChange([(isNaN(e)) ? 100 : e, "two"]);
					}}
					onBlur={event => {
					 let value = Number(event.target.value);
					 if (isNaN(value)) {
						 value = 100;
					 }
					 setPercent([percent[0], value])
					}}
				/>
			</div>
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
	];

	const smallTable = () => {
		columns.unshift({
			Header: "Name",
			columns: [
				fullNameColumn
			]
		});
		columns.push(percentColumnOptions);
	};
	const standardTable = () => {
		columns.unshift({
			columns: [
				firstNameColumn,
				lastNameColumn
			]
		});
		columns.unshift(pictureColumn);
		columns.push(constituencyColumn);
		columns.push(percentColumnSlider);
		columns.push(voteColumn);
	};

	if (window.innerWidth <= 768) {
		smallTable()
	}
	else {
		standardTable()
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
