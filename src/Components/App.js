import React from 'react';
import MainPage from "./MainPage";
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import FilterSession from "./FilterSession";
import SessionSelection from "./SessionSelection";
import {DailContextProvider} from "../contexts/DailContext/DailContext";
import ConstituencyMapPageComponent from "./ConstituencyMapPage/ConstituencyMapPageComponent";


class App extends React.Component {
	render() {
		return (
			<DailContextProvider>
				<Router basename='/'>
					<Switch>
						<Route path="/" exact component={MainPage}/>
						<Route path="/session/:id" component={FilterSession}/>
						<Route path="/session/" component={FilterSession}/>
						<Route path="/map" component={ConstituencyMapPageComponent}/>
						<Route path="*" component={SessionSelection} status={404} />
					</Switch>
				</Router>
			</DailContextProvider>
		)
	}
}

export default App;
