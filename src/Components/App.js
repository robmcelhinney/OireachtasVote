import React from 'react';
import MainPage from "./MainPage";
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import FilterSession from "./FilterSession";
import SessionSelection from "./SessionSelection";
import ConstituencyMapComponent from "./ConstituencyMapComponent";
import {DailContextProvider} from "../DailContext";


class App extends React.Component {
	render() {
		return (
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
		)
	}
}

export default App;
