import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Table from './Table';
import Info from "./Info";
import ordinal from "ordinal";
import {Link} from "react-router-dom";
import {getData} from "./helper";

const formatDate = (dateString) => {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) {
		return dateString;
	}
	return date.toLocaleDateString("en-IE");
};

class MainPage extends React.Component {

	constructor(props) {
		super(props);
		let dail_session = props.session;
		document.title = "Oireacthas Vote"
		this._isMounted = false;
		this._loadSeq = 0;

		this.state = {
			excludeCabinet: false,
			excludeZeroVotes: false,
			info: null,
			data: null,
			members: null
		};
		this.loadData(dail_session);
	}

	loadData = async (session) => {
		const seq = ++this._loadSeq;
		const [info, members] = await getData(session);
		if (!this._isMounted || seq !== this._loadSeq) {
			return;
		}
		this.setState({
			info: info,
			data: members,
			members: members,
			excludeCabinet: false,
			excludeZeroVotes: false,
		});
	};

	componentDidMount() {
		this._isMounted = true;
	}

	componentDidUpdate(prevProps) {
		if (this.props.session !== prevProps.session) {
			this.loadData(this.props.session);
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
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
		if(data === null || info === null){
			return <div className={"maincontent container"}>Ag lódáil...</div>;
		}
		let dail_end_date;
		if (info.dailEndDate === "2099-01-01") {
			dail_end_date = "Present"
		}
		else {
			dail_end_date = formatDate(info.dailEndDate)
		}
		return (
			<>
				<div className={"maincontent container"}>
					<div className={"mainHero"}>
						<h1 className={"mainHeader"}>TD Voting Record - {ordinal(Number(info.dail))} Dáil</h1>
						<h3 className={"subHeader"}>{formatDate(info.dailStartDate)} - {dail_end_date}</h3>
						<p className={"sessionStat"}>Data source: <a href="https://data.oireachtas.ie/">data.oireachtas.ie</a></p>
						<p className={"sessionStat"}>Total Votes during session: <strong>{info.totalVotes}</strong></p>
						<div className={"filterRow"}>{this.getFormGroup()}</div>
					</div>
					<Table members={data} info={info}/>
					<p>An asterisk (*) next to a member&apos;s name indicates that they have not been present for the full term, hover over/click the asterisk (*) for more info.</p>
					<Info info={info}/>
					<p><span className={"should_be"}>*should be*</span> Accurate as of {info.dateCreated}</p>
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

export default MainPage;
