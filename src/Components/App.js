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
			excludeTaoiseach: false,
			data: members,
		};
	}

	handleChecked = () => {
		this.setState({excludeCabinet: !this.state.excludeCabinet});
		const newSelection = !this.state.excludeCabinet;
		this.handleAlterMembers(newSelection);
	};

	handleAlterMembers = (newSelection) => {
		if (newSelection) {
			let data = [];
			members.forEach(
				member => {
					if (!member["office"]) {
						data.push(member)
					}}
			);
			this.setState({data: data});
		}
		else {
			if (this.state.data !== members) {
				this.setState({data: members})
			}
		}
	};

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
										  onChange={() =>
										  this.handleChecked()}
										  value={this.state.excludeCabinet} />
						}
							label="Exclude Cabinet Members"
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
				<p>Plan to run the web scraper at least once a week to keep the
					info relevant.</p>
				<p>If you have any ideas please let me know on
					Twitter/Github below, i.e. should I keep TDs no longer
					in the Dáil (Current MEPs) or should I automatically
					remove the Ceann-Comhairle <span className={"should_be"}>
					blame https://data.oireachtas.ie/</span></p>
			</div>
			<div id={"footer"}
				style={{color: 'black'}}>
				Any queries/requests, contact me @<a
				href={"https://twitter.com/RMcElhinney"}>Rob McElhinney
				</a> | Code Viewable @<a
				href={"https://github.com/robmcelhinney/oireachtasVote"}>github</a>
			</div>
			</>
		);
	}
}

export default App;
