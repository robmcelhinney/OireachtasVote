import React from 'react';
// import TDCard from './TDCard';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import members from '../members.json';

let data = members;

function filterCaseInsensitive(filter, row) {
	const id = filter.pivotId || filter.id;
	console.log("id: ", id);
	if (["party", "firstName", "lastName"].includes(id)) {
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


function App-react-table() {
	return (
		<div className="App">
			<ReactTable
				data={data}
				columns={[
					{
						id: 'picture',
						accessor: d => {
							return <div><img className={"member__avatar"} src={"https://data.oireachtas.ie/ie/oireachtas/member/id/" + d.member_id + "/image/thumb"}/></div>
						},
						filterable: false,
						maxWidth: '150',
					},
					{
						Header: "Name",
						columns: [
							{
								Header: "First Name",
								accessor: "firstName"
							},
							{
								Header: "Last Name",
								accessor: "lastName",
							}
						]
					},
					{
						Header: "Info",
						columns: [
							{
								Header: "Party",
								accessor: "party"
							},
							{
								Header: "Votes",
								accessor: "votes"
							},
							{
								Header: "Percent",
								id: 'percent',
								accessor: d => {
									return d.percentVotes
								},
							}
						]
					}
				]}
				defaultPageSize={15}
				filterable
				className="-striped -highlight"
				defaultFilterMethod={(filter, row) => filterCaseInsensitive(filter, row)}
			/>
		</div>
	);
}

export default App-react-table;
