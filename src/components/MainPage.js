import React from 'react';
import 'react-table/react-table.css';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Table from './Table';
import Info from "./Info";
import moment from 'moment'
import ordinal from "ordinal";
import {Link} from "react-router-dom";
import {getData} from "./helper";


class MainPage extends React.Component {

	constructor(props) {
		super(props);
		let dail_session = props.session;
		document.title = "Oireacthas Vote"
		const [info, members] = getData(dail_session);

		this.state = {
			excludeCabinet: false,
			excludeZeroVotes: false,
			info: info,
			data: members,
			members: members
		};
	}


	componentDidUpdate(prevProps) {
		if (this.props.session !== prevProps.session) {
			const [info, members] = getData(this.props.session);
			this.setState( {
				info: info,
				data: members,
				members: members,
			})
		}
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
		let dail_end_date;
		if (info.dailEndDate === "2099-01-01") {
			dail_end_date = "Present"
		}
		else {
			dail_end_date = moment(info.dailEndDate).format('DD/MM/YYYY')
		}
		if(data === null || info === null){
			return;
		}
		return (
			<>
				<div className={"maincontent container"}>
					<div>
						<h1 className={"mainHeader"}>TD Voting Record - {ordinal(Number(info.dail))} Dáil</h1>
						<h3 className={"subHeader"}>{moment(info.dailStartDate).format('DD/MM/YYYY')} - {dail_end_date}</h3>
						<p>View old Dáil Sessions <Link to={"/session/"}>here</Link>.</p>
						<p><Link to={"/map"}>Map View</Link></p>
						<p>Total Votes during session: {info.totalVotes}</p>
						{this.getFormGroup()}
					</div>
					<Table members={data} info={info}/>
					<Info info={info}/>
					<p><span className={"should_be"}>*should be*</span> Accurate as of {info.dateCreated}</p>
					{getBottomText()}
				</div>
			</>
		);
	}

	getFormGroup() {
		return <FormGroup row>
			<FormControlLabel
				control={
					<Checkbox checked={this.state.excludeCabinet}
							  value={this.state.excludeCabinet}
							  onChange={() =>
								  this.handleCheckedCabinet("cabinet")
							  }/>
				}
				label="Exclude Cabinet Members"
			/>
			<FormControlLabel
				control={
					<Checkbox checked={this.state.excludeZeroVotes}
							  value={this.state.excludeZeroVotes}
							  onChange={() =>
								  this.handleCheckedCabinet("zero")
							  }/>
				}
				label="Exclude TDs without votes"
			/>
		</FormGroup>;
	}
}

const getBottomText = () => {
	return <>
		<p>Plan to run the web scraper around once a week to keep the
			info relevant. Let me know if it hasn't been done in a while.</p>
		<p>An asterisk (*) next to a member's name indicates that they have not been
			present for the full term, hover over/click the asterisk (*) for more info.</p>
		<p>If you have any ideas please let me know on
			Twitter/Github below, i.e. should I deal with newly elected TDs differently, & should
			I automatically remove the Ceann-Comhairle? <span className={"should_be"}>
				blame <a href="https://data.oireachtas.ie/">data.oireachtas.ie</a> for that one</span></p>
	</>
};

export default MainPage;
