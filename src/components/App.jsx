import React, { Suspense, lazy } from "react";
import {HashRouter as Router, Route, Switch} from 'react-router-dom'
import {DailContextProvider} from "../DailContext";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

const MainPage = lazy(() => import("./MainPage"));
const FilterSession = lazy(() => import("./FilterSession"));
const SessionSelection = lazy(() => import("./SessionSelection"));
const Map = lazy(() => import("./Map"));

class App extends React.Component {
	render() {
		return (
			<DailContextProvider>
				<Suspense fallback={<div className={"maincontent container"}>Ag lódáil...</div>}>
					<div className="appShell">
						<Router basename='/'>
							<SiteHeader />
							<main className="appMain">
								<Switch>
									<Route path="/" exact component={MainPage}/>
									<Route path="/session/:id" component={FilterSession}/>
									<Route path="/session/" component={FilterSession}/>
									<Route path="/map" component={Map}/>
									<Route path="*" component={SessionSelection} status={404} />
								</Switch>
							</main>
							<Footer />
						</Router>
					</div>
				</Suspense>
			</DailContextProvider>
		)
	}
}

export default App;
