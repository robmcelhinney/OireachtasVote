import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import PartyValueList from "./PartyValueList";


const useStyles = makeStyles({
	card: {
		minWidth: 275,
		marginTop: 20,
		color: '#5d5d5d',
	},
	cardTop: {
		backgroundColor: 'whitesmoke',
		boxShadow: '0 2px 1px -1px rgba(0,0,0,0.06),0 1px 1px 0 rgba(0,0,0,0.04),0 1px 3px 0 rgba(0,0,0,0.04)',
	},
	cardHeader: {
		font: 'normal normal normal 1.5em/1em \'QuicksandBold\''
	}
});

const Info = ({info}) => {
	const [medians, setMedians] = useState(
		[]
	);
	const [averages, setAverages] = useState(
		[]
	);

	useEffect(() => {
		if (info.partyMedian !== undefined) {
			setMedians(info.partyMedian);
		}
		if (info.partyAverages !== undefined) {
			setAverages(info.partyAverages);
		}
	}, [info]);

	const classes = useStyles();

	console.log("medians: ", medians);

	return (
		<Card className={classes.card}>
			<CardContent className={classes.cardTop}>
				<Typography variant="h5" component="h2"
							className={classes.cardHeader}>
					Party Voting Medians*
				</Typography>
			</CardContent>
			<CardContent>
				<PartyValueList dict={medians}/>
			</CardContent>

			<CardContent className={classes.cardTop}>
				<Typography variant="h5" component="h2"
							className={classes.cardHeader}>
					Party Voting Averages*
				</Typography>
			</CardContent>
			<CardContent>
				<PartyValueList dict={averages}/>
				<p id={"averages-exemption"}>*Party Averages & Medians exclude any members without votes.</p>
			</CardContent>
		</Card>
	);
};

export default Info;
