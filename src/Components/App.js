import React from 'react';
import 'react-table/react-table.css';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Table from './Table';
import info from '../info.json';
import members_json from '../members.json';
import Info from "./Info";


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			excludeCabinet: false,
			excludeZeroVotes: false,
			members: [],
			data: [],
			info: []
		};
	}

	componentDidMount() {
	this.setState({
		info: info,
		data: members_json,
		members: members_json
	});
	}

	handleCheckedCabinet = (type) => {
		let data = this.state.data;
		if (type === "cabinet"){
			this.setState({excludeCabinet: !this.state.excludeCabinet});
			const cabinetSelection = !this.state.excludeCabinet;
			data = this.handleAlterMembers(cabinetSelection);
			if (this.state.excludeZeroVotes) {
				data = this.excludeZeroVotes(data);
			}
		}
		else {
			this.setState({excludeZeroVotes: !this.state.excludeZeroVotes});
			const zeroSelection = !this.state.excludeZeroVotes;
			data = this.handleAlterZeroVotes(zeroSelection, data);
			if (this.state.excludeCabinet) {
				data = this.excludeCabinet(data);
			}
		}
		this.setState({data: data});
	};

	handleAlterMembers = (newSelection) => {
		const { members } = this.state;
		if (newSelection) {
			return this.excludeCabinet(members);
		}
		else {
			return (this.state.data !== members) ? members : this.state.data;
		}
	};

	handleAlterZeroVotes = (zeroSelection) => {
		const { members } = this.state;
		if (zeroSelection) {
			return this.excludeZeroVotes(this.state.data);
		}
		else {
			return members;
		}
	};


	excludeCabinet(selection_members) {
		let result = [];
		selection_members.forEach(
			member => {
				if (!member["office"]) {
					result.push(member)
				}
			}
		);
		return result;
	}

	excludeZeroVotes(selection_members) {
		let result = [];
		selection_members.forEach(
			member => {
				if (member["votes"] !== 0) {
					result.push(member)
				}
			}
		);
		return result;
	}

	render() {
		const { data, info } = this.state;
		return (
			<>
			<div id={"maincontent"} className={"container"}>
				<div id={"headerInfo"}>
					<h1 className={"mainHeader"}>TD Voting Record - {info.currentDail}</h1>
					<p><span className={"should_be"}>*should be*</span> Accurate as of {info.dateCreated}</p>
					<FormGroup row>
						<FormControlLabel
							control={
								<Checkbox checked={this.state.excludeCabinet}
										  value={this.state.excludeCabinet}
										  onChange={() =>
										  this.handleCheckedCabinet("cabinet")
										  } />
						}
							label="Exclude Cabinet Members"
						/>
						<FormControlLabel
							control={
								<Checkbox checked={this.state.excludeZeroVotes}
										  value={this.state.excludeZeroVotes}
										  onChange={() =>
											  this.handleCheckedCabinet("zero")
										  } />
							}
							label="Exclude TDs without votes"
						/>
					</FormGroup>
				</div>
				<Table members={data}/>
				<Info info={info}/>
				<p>Plan to run the web scraper around once a week to keep the
					info relevant. Let me know if it hasn't been done in a while.</p>
				<p>An asterick (*) next to a member's name indicates that they have not been
				    present for the full term, hover over/click the asterick (*) for more info.</p>
				<p>If you have any ideas please let me know on
					Twitter/Github below, i.e. should I keep TDs who have since left the Dáil
					(Current MEPs), should I deal with newly elected TDs differently, & should
					I automatically remove the Ceann-Comhairle? <span className={"should_be"}>
					blame <a href="https://data.oireachtas.ie/">data.oireachtas.ie</a> for that one</span></p>
			</div>
			<div id={"footer"}
				style={{color: 'black'}}>
				Any queries/requests, contact me @<a
				href={"https://twitter.com/RMcElhinney"}>Rob McElhinney
				</a> | Code Viewable @<a
				href={"https://github.com/robmcelhinney/OireachtasVote"}>github</a>
			</div>
			</>
		);
	}
}

export default App;
