import React from 'react';
import 'react-table/react-table.css';
import info from '../info.json';
import "nouislider/distribute/nouislider.css";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Table from './Table';
import members from '../members.json';


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			excludeCabinet: false,
			excludeZeroVotes: false,
			// excludeTaoiseach: false,
			data: members,
		};
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
		if (newSelection) {
			return this.excludeCabinet(members);
		}
		else {
			return (this.state.data !== members) ? members : this.state.data;
		}
	};

	handleAlterZeroVotes = (zeroSelection) => {
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
		return (
			<>
			<div id={"maincontent"} className={"container"}>
				<div id={"headerInfo"}>
					<h1 className={"mainHeader"}>TD Voting Record - {info.currentDail}</h1>
					<p><span className={"should_be"}>**should be**</span> Accurate as of {info.dateCreated}</p>
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
						{/*<FormControlLabel*/}
							{/*control={*/}
								{/*<Checkbox checked={this.state.excludeTaoiseach}*/}
										  {/*onChange={() =>*/}
											  {/*this.handleChecked("taoiseach")}*/}
										  {/*value={this.state.excludeTaoiseach} />*/}
							{/*}*/}
							{/*label="Exclude Taoiseach"*/}
						{/*/>*/}
					</FormGroup>
				</div>
				<Table members={this.state.data}/>
				<p>Plan to run the web scraper around once a week to keep the
					info relevant. Let me know if it hasn't been done in a while.</p>
				<p>Duplicates are from the Oireachtas API, they should
					automatically be removed when their end is fixed.</p>
				<p>If you have any ideas please let me know on
					Twitter/Github below, i.e. should I keep TDs no longer
					in the Dáil (Current MEPs), how should I deal with new TDs
					who joined during Dáil session, & should I automatically
					remove the Ceann-Comhairle? <span className={"should_be"}>
					blame <a href="https://data.oireachtas.ie/">data.oireachtas.ie</a></span></p>
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
