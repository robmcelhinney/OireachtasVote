import React from 'react';
import MUIDataTable from "mui-datatables";
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

{/*<div><img alt={""} className={"member__avatar"} src={"https://data.oireachtas.ie/ie/oireachtas/member/id/" + d.member_id + "/image/thumb"}/></div>*/}

const columns = [
	{
		name: "https://data.oireachtas.ie/ie/oireachtas/member/id/member_id/image/thumb",
		label: "picture",
		options: {
			filter: false,
			sort: false,
			searchable: false,
		}
	},
	{
		name: "firstName",
		label: "First Name",
		options: {
			filter: false,
			sort: true,
			searchable: true,
		}
	},
	{
		name: "lastName",
		label: "Last Name",
		options: {
			filter: false,
			sort: true,
			searchable: true,
			sortDirection: 'asc'
		}
	},
	{
		name: "party",
		label: "Party",
		options: {
			filter: true,
			sort: true,
			searchable: true,
		}
	},
	{
		name: "votes",
		label: "Votes",
		options: {
			filter: true,
			sort: true,
		}
	},
	{
		name: "percentVotes",
		label: "Percent",
		options: {
			filter: true,
			sort: true,
		}
	},
];


const options = {
	print: false,
	download: false,
	selectableRows: "none",
	selectableRowsHeader: false,
};

function App() {
	return (
		<div className="App">
			<MUIDataTable
				title={"TD Voting Percentage"}
				data={data}
				columns={columns}
				options={options}
			/>
		</div>
	);
}

export default App;



// defaultPageSize={15}
// filterable
// className="-striped -highlight"
// defaultFilterMethod={(filter, row) => filterCaseInsensitive(filter, row)}
