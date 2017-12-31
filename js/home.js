
import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
} from 'react-native';

import Hr from 'react-native-hr';
import ActionButton from 'react-native-action-button';
import {Circle} from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocalizedStrings from 'react-native-localization';

import client_call from "./client";

class HomeScreen extends Component {

	strings = new LocalizedStrings({
		"en":{
			subText: "The more chance you have, the more likely you win.",
			jackpotText: "Jackpot",
			subJackpot1: "A",
			subJackpot2: "of the goal of",
			lastWinnerText: "Last Winner",
		},
		"es":{
			subText: "Entre más chance más oportunidad tienes de ganar.",
			//subText: "Entre más chance más cerca estas de ganar.",
			jackpotText: "Jackpot",
			subJackpot1: "Un",
			subJackpot2: "de la meta de",
			lastWinnerText: "Ganador Pasado",
		},
	});

	static navigationOptions = ({navigation}) => {
		return {
			title: 'Chance',
			headerStyle: {backgroundColor:"#F8A42F"},
			headerTintColor: "#FFFFFF",
			headerRight: (<TouchableOpacity onPress={() => navigation.navigate("About",{"user": true})}>
							<View style={{margin:12}}><Icon size={28} color="#FFFFFF" name="information"/></View>
						</TouchableOpacity>),
		};
	};

	constructor(props) {
		// params:{"user": user, "jackpot":data.jackpot, "resultLimit":data.resultLimit, "chance":data.chance}
		super(props);

		this.user = this.props.navigation.state.params.user;
		this.resultLimit = this.props.navigation.state.params.resultLimit;
		this.lastWinner = this.props.navigation.state.params.lastWinner;
		this.adHours = this.props.navigation.state.params.adHours;

		this.state = {
			chance: this.props.navigation.state.params.chance,
			jackpot: this.props.navigation.state.params.jackpot,
			progress: 0,
		};

	};

	componentDidMount(){

		client_call("get", "update", {"email":this.user.email}, (data) => {
			this.updateState(data.jackpot, data.chance);
		});

		this.updateTimer = setInterval(()=>{
			client_call("get", "update", {}, (data) => {
				this.updateState(data.jackpot, false);
			});
		}, 30000); // 30 segundos
		
	};

	componentWillUnmount(){
		clearInterval(this.updateTimer);

		this.setState((prevState) => {
			prevState.progress = 0;
			prevState.jackpot = 0;
			return prevState;
		});

	};

	updateState(newJackpot, newChance){
		console.log("Page Updated");

		this.setState((prevState) => {
			newState = {
				chance: prevState.chance,
				jackpot: newJackpot,
				progress: newJackpot/this.resultLimit,
			};
			if ((newChance || false) != false){
				newState.chance = newChance;
			};
			return newState;
		});

	};

	toPay(){
		this.componentWillUnmount();
		this.props.navigation.navigate("Pay", {"user": this.user, "adHours": this.adHours, "home": this});
	};

	toLocaleString(num){
		return (num).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	};

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.chanceText}>
					Chance x{this.state.chance}
				</Text>
				<Text style={styles.chanceSubText}>
					{this.strings.subText}
				</Text>
				<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:10}} />

				<Text style={styles.jackpotText}>
					{this.strings.jackpotText}
				</Text>

				{/*animated={false}*/}
				<Circle textStyle={{fontWeight:"bold"}} color={"#F8A42F"} borderWidth={5} size={150} thickness={15} progress={this.state.progress} showsText={true} formatText={p => {return '$'+this.toLocaleString(this.state.jackpot/100)}} />

				<Text style={styles.jackpotValue}>
					{this.strings.subJackpot1} <Text style={{fontSize: 20, fontWeight: "bold", color: "#F8A42F"}}>%{Math.floor(this.state.progress*100)}</Text> {this.strings.subJackpot2} <Text style={{fontSize: 20, fontWeight: "bold"}}>${this.toLocaleString(this.resultLimit/100)}</Text>
				</Text>

				<Text style={{fontSize:15, marginTop:10}}>
					{this.strings.lastWinnerText}
				</Text>
				<Text style={{fontWeight:"bold", fontSize:19}}>
					{this.lastWinner}
				</Text>

				<ActionButton icon={<Icon size={40} color="#FFFFFF" name="ticket"/>} buttonColor="#F8A42F" onPress={() => {this.toPay()}}/>

			</View>
		);
	};
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
	},
	chanceText:{
		fontSize: 40,
		textAlign: 'center',
		margin: 30,
	},
	chanceSubText:{
		fontSize: 14,
		color: "rgb(110,110,110)",
		textAlign: 'center',
		marginBottom: 15,
	},
	jackpotText:{
		fontSize: 35,
		textAlign: 'center',
		margin: 15,
	},
	jackpotValue:{
		fontSize: 15,
		textAlign: 'center',
		margin: 10,
	},
});

module.exports = HomeScreen;
