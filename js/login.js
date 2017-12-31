
import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Alert,
	BackHandler,
	ToastAndroid,
	Image,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Spinner from 'react-native-loading-spinner-overlay';
import {GoogleSignin} from 'react-native-google-signin';
import {NavigationActions} from 'react-navigation';
import LocalizedStrings from 'react-native-localization';
import RNFS from 'react-native-fs';

import client_call from "./client";

class LoginScreen extends Component{

	strings = new LocalizedStrings({
		"en":{
			networkAlertTitle: "An error ocurred while connecting to the network. Please check your internet connection and try again.",
			errorAlertTitle: "An error ocurred while conecction with your user.",
			silentLoginToastText:"Logged in successfully",
			spinnerText: "Establishing connection with the server...",
			mainText: "Earn money the easiest way possible",
			start: "Start",
			bulletPoints: "• See ads \n\n• Increase your chances \n\n• Wait for the jackpot goal \n\n• Win the raffle \n",
			termsText: "By participating, you agree to our",
			termsButton: "Terms & Conditions.",
		},
		"es":{
			networkAlertTitle: "Ocurrio un problema conectandose con la red. Compruebe su conexión a internet y vuelva a intentarlo.",
			errorAlertTitle: "Ocurrio un problema conectandose con su usuario.",
			silentLoginToastText:"Inicio de sesión exitosa",
			spinnerText: "Estableciendo conexión con el servidor...",
			mainText: "Ganar dinero de la manera más fácil",
			start: "Comenzar",
			bulletPoints: "• Ve anuncios \n\n• Aumenta tus posibilidades \n\n• Espera la meta del jackpot \n\n• Gana el sorteo \n",
			termsText: "Al participar, usted acepta nuestros",
			termsButton: "Terminos y Condiciones.",
		},
	});

	NETWORK_ERROR = 7;

	networkAlert = [
		"Error",
		this.strings.networkAlertTitle,
		[
			{text:"Ok", onPress: () => BackHandler.exitApp()},
		],
		{cancelable: false},
	];

	errorAlert = [
		"Error",
		this.strings.errorAlertTitle,
		[
			{text:"Ok"},
		],
		{cancelable: false},
	];

	termsAlert = (msg) => {
		return [
			this.strings.termsButton.slice(0, -1),
			msg,
			[
				{text:"Ok"},
			],
		];
	};

	silentLoginToast = [this.strings.silentLoginToastText, ToastAndroid.SHORT];

	static navigationOptions = {
		title: 'Login',
		header: null,
	};

	constructor(props){
		super(props);

		this.state = {
			spinnerVisible: false,
			loaded: false,
		};

		this.disconnect = false;
		if (this.props.navigation.state.params != null){
			if (this.props.navigation.state.params.disconnect){
				this.disconnect = true;
				this.state.loaded = true;
			};
		};
	};

	componentDidMount(){

		GoogleSignin.hasPlayServices({ autoResolve: true }).then(() => {

			GoogleSignin.configure({
				webClientId: "608588877602-7galfvgf1mee9lgl5c088qh5t4sr6brs.apps.googleusercontent.com",
			}).then(() => {
				// you can now call currentUserAsync()
				GoogleSignin.currentUserAsync().then((user) => {
					if (user != null){
						if (this.disconnect){
							GoogleSignin.signOut().then(() => {
								console.log("Google Log Out");
							}).catch((err) => {
								console.log("Google Log Out ERROR: "+err);
							});
						}else{
							this.enter(user);
						};
					}else{
						this.setState((prevState) => {
							prevState.loaded = true;
							return prevState;
						});
					};
				}).done();
			});

		}).catch((err) => {
			if (err.code == this.NETWORK_ERROR){
				Alert.alert.apply({}, this.networkAlert);
			};
			console.log("Play services error", err.code, err.message);
		})

	};

	enter(user){
		console.log("Enter");

		this.setState((prevState) => {
			prevState.spinnerVisible = true;
			prevState.loaded = true;
			return prevState;
		});

		//conectarse con el servidor

		client_call("post", "login", user, (data) => {
			this.setState((prevState) => {
				prevState.spinnerVisible = false;
				return prevState;
			});

			/*if (data.new){ // new users
			}else{
			};*/

			console.log("login Successfull");
			ToastAndroid.show(this.silentLoginToast[0], this.silentLoginToast[1]);

			//cambiar pagina
			const resetAction = NavigationActions.reset({
				index: 0,
				actions: [
					NavigationActions.navigate({ routeName: 'Home', params:{"user": user, "jackpot":data.jackpot, "resultLimit":data.resultLimit, "chance":data.chance, "lastWinner":data.lastWinner, "adHours":data.adHours}})
				]
			});
			this.props.navigation.dispatch(resetAction);

		});

	};

	loginPress(){

		GoogleSignin.signIn().then((user) => {
			console.log(user);
			this.enter(user);
		}).catch((err) => {
			if (err.code == this.NETWORK_ERROR){
				Alert.alert.apply({},this.networkAlert);
			}else{
				Alert.alert.apply({},this.errorAlert);
			};
			console.log('SIGNIN ERROR', err);
		}).done();

	};

	showTermsAlert(){
		RNFS.readFileAssets("TERMS AND CONDITIONS").then((res) => {
			Alert.alert.apply({}, this.termsAlert(res))
		});
	};

	render() {
		if (this.state.loaded){
			return (

				<View style={styles.container}>

					<Spinner overlayColor="rgba(0, 0, 0, 0.7)" size={60} visible={this.state.spinnerVisible} textContent={this.strings.spinnerText} textStyle={{color: '#FFF', textAlign: 'center'}}/>

					<ScrollView>
					<Image 
						style={{width: 120, height: 120, alignSelf: "center", margin: 30,}}
						source={require("../assets/logo.png")} />

					
					<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:20}}/>
					<Text style={styles.main}>
						{this.strings.mainText}
					</Text>

					<View style={{flexDirection: 'row', justifyContent: 'center', margin:10}}>
						<Text style={styles.instList}>
							{this.strings.bulletPoints}
						</Text>
					</View>
					
					</ScrollView>

					<View style={styles.bottom}>

						<Button style={styles.loginButton} onPress={() => this.loginPress()} containerStyle={styles.loginButtonContainer}>
							{this.strings.start}
						</Button>

						<View style={styles.termsView}>
							<Text style={{textAlign:"center"}}>
								{this.strings.termsText}
							</Text>
							<TouchableOpacity onPress={() => this.showTermsAlert()}>
								<Text style={styles.termsButton}>{this.strings.termsButton}</Text>
							</TouchableOpacity>
						</View>

					</View>
				</View>
			);
		}else{
			return (<View></View>);
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
	},
	main:{
		fontWeight: "bold",
		fontSize: 23,
		textAlign: 'center',
		margin: 40,
		marginTop: 18,
		marginBottom: 13,
	},
	instList: {
		textAlign: "justify",
		fontSize: 18,
		lineHeight: 15,
	},
	title: {
		fontSize: 40,
		textAlign: 'center',
		margin: 30,
	},
	loginButton:{
		flex:4,
		fontSize: 20,
		paddingBottom:2,
		margin:0,
		color: 'white',
		textAlign: 'center',
	},
	bottom:{
		position: 'absolute',
		bottom:0,
		right:0,
		left:0,
		justifyContent: 'space-between',
		margin:50,
		marginBottom:20,
	},
	loginButtonContainer:{
		overflow:'hidden',
		right:0,
		left:0,
		padding:10,
		borderRadius:15,
		backgroundColor: '#F7931E',
	},
	termsView: {
		marginTop:3,
	},
	termsButton: {
		textAlign:"center", 
		fontWeight:"bold", 
		color: "#F8A42F", 
		fontSize:16,
	},
});

module.exports = LoginScreen;
