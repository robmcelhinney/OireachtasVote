import React from 'react';
import { Helmet } from "react-helmet"
import { Router } from "@reach/router"
import { DailContextProvider } from "../DailContext";
import MainPage from "../components/MainPage";
import Session from "../components/FilterSession";
import SessionSelection from "../components/SessionSelection";
import Map from "../components/Map";
import Footer from "../components/Footer";


class App extends React.Component {
	render() {
		return (
			<>
			<div className="application">
				<Helmet>
					<meta charSet="utf-8" />
					<title>Oireachtas Vote</title>
					<link rel="canonical" href="http://robmcelhinney.com/OireachtasVote/" />
				</Helmet>
			</div>
			<DailContextProvider>
				<Router basepath='/'>
					<MainPage exact path="/" />
					<Session path="/session/:id" />
					<Session path="/session" />
					<Map path="/map" />
				</Router>
			</DailContextProvider>
			<Footer />
			</>
		)
	}
}

export default App;
