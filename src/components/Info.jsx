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
		color: 'var(--text-soft)',
		backgroundColor: 'var(--surface)',
		border: '1px solid var(--border)',
	},
	cardTop: {
		backgroundColor: 'var(--surface-soft)',
		boxShadow: 'inset 0 -1px 0 var(--border)',
	},
	cardHeader: {
		font: 'normal normal normal 1.5em/1em \'QuicksandBold\'',
		fontDisplay: 'swap',
		color: 'var(--text)'
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
