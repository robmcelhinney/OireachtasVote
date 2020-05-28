import React from 'react';
import { Helmet } from "react-helmet"
import MainPage from "../components/MainPage";
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import FilterSession from "../components/FilterSession";
import SessionSelection from "../components/SessionSelection";
import ConstituencyMapComponent from "../components/ConstituencyMapComponent";
import {DailContextProvider} from "../DailContext";


class App extends React.Component {
	render() {
		return (
			<>
			<div className="application">
				<Helmet>
					<meta charSet="utf-8" />
					<title>Robert McElhinney</title>
					<link rel="canonical" href="http://robmcelhinney.com/OireachtasVote/" />
				</Helmet>
			</div>
			<DailContextProvider>
				<Router basename='/'>
					<Switch>
						<Route path="/" exact component={MainPage}/>
						<Route path="/session/:id" component={FilterSession}/>
						<Route path="/session/" component={FilterSession}/>
						<Route path="/map" component={ConstituencyMapComponent}/>
						<Route path="*" component={SessionSelection} status={404} />
					</Switch>
				</Router>
			</DailContextProvider>
			</>
		)
	}
}

export default App;
