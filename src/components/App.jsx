import React, { Suspense, lazy } from "react";
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import {DailContextProvider} from "../DailContext";
import SiteHeader from "./SiteHeader";

const MainPage = lazy(() => import("./MainPage"));
const FilterSession = lazy(() => import("./FilterSession"));
const SessionSelection = lazy(() => import("./SessionSelection"));
const Map = lazy(() => import("./Map"));

class App extends React.Component {
	render() {
		return (
			<DailContextProvider>
				<Suspense fallback={<div className={"maincontent container"}>Ag lódáil...</div>}>
					<Router basename='/'>
						<SiteHeader />
						<Switch>
							<Route path="/" exact component={MainPage}/>
							<Route path="/session/:id" component={FilterSession}/>
							<Route path="/session/" component={FilterSession}/>
							<Route path="/map" component={Map}/>
							<Route path="*" component={SessionSelection} status={404} />
						</Switch>
					</Router>
				</Suspense>
			</DailContextProvider>
		)
	}
}

export default App;
