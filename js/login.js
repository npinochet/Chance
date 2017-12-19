/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
} from 'react-native';

import Button from 'react-native-button';
import Hr from 'react-native-hr';
import Spinner from 'react-native-loading-spinner-overlay';
import {GoogleSignin} from 'react-native-google-signin';
import {NavigationActions} from 'react-navigation';
import LocalizedStrings from 'react-native-localization';

import client_call from "./client";

class LoginScreen extends Component{

	strings = new LocalizedStrings({
		"en":{
			networkAlertTitle: "An error ocurred while connecting to the network. Please check your internet connection and try again.",
			errorAlertTitle: "An error ocurred while conecction with your user.",
			silentLoginToastText:"Logged in successfully",
			spinnerText: "Establishing connection with the server...",
			mainText: "Your chance to earn money the easiest way possible",
			start: "Start",
			about: "About Us",
		},
		"es":{
			networkAlertTitle: "Ocurrio un problema conectandose con la red. Compruebe su conexión a internet y vuelva a intentarlo.",
			errorAlertTitle: "Ocurrio un problema conectandose con su usuario.",
			silentLoginToastText:"Inicio de sesión exitosa",
			spinnerText: "Estableciendo conexión con el servidor...",
			mainText: "Tenga la oportunidad de ganar dinero de la manera más fácil",
			start: "Comenzar",
			about: "Acerca de Nosotros",
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
				//iosClientId: <FROM DEVELOPER CONSOLE>, // only for iOS
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

	render() {
		if (this.state.loaded){
			return (
				<View style={styles.container}>

					<Spinner overlayColor="rgba(0, 0, 0, 0.7)" size={60} visible={this.state.spinnerVisible} textContent={this.strings.spinnerText} textStyle={{color: '#FFF', textAlign: 'center'}}/>

					<Image 
						style={{width: 120, height: 120, alignSelf: "center", margin: 30,}}
						source={require("../assets/logo.png")} />

					
					<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:20}}/>
					<Text style={styles.main}>
						{this.strings.mainText}
					</Text>

					<View style={styles.bottom}>

						<Button style={styles.loginButton} onPress={() => this.loginPress()} containerStyle={styles.loginButtonContainer}>
							{this.strings.start}
						</Button>

						<TouchableOpacity onPress={() => this.props.navigation.navigate("About")}>
							<Text style={styles.footer}>{this.strings.about}</Text>
						</TouchableOpacity>

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
		fontSize: 30,
		textAlign: 'center',
		margin: 30,
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
		borderRadius:30,
		backgroundColor: '#F7931E',
	},
	footer:{
		fontSize: 17,
		textAlign: 'center',
		marginTop: 20,
		color: "#F8A42F"
	},

});

module.exports = LoginScreen;
