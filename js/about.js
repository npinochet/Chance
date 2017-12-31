
import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	Linking,
	Alert,
	ScrollView,
} from 'react-native';

import Hr from 'react-native-hr';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-button';
import {NavigationActions} from 'react-navigation';
import LocalizedStrings from 'react-native-localization';
import RNFS from 'react-native-fs';

class AboutScreen extends Component {

	strings = new LocalizedStrings({
		"en":{
			logoutAlertTitle: "Log Out",
			logoutAlertText: "Are you sure you want to log out?",
			acept: "Yes",
			title: "About",
			header: "Your chance to win money easily and free",
			body: "is a raffle service where everyone can participate, just watch ads to have more chance to win. The prize is drawn when the jackpot, made from the profits of the ads and purchases, reaches it's goal, where a single winner will be chosen at random.",
			facebook: "Check our Facebook",
			logout: "Log Out",
			termsTitle: "Terms & Conditions",
		},
		"es":{
			logoutAlertTitle: "Cerrar Sesión",
			logoutAlertText: "¿Esta seguro que quiere cerrar la sesión?",
			acept: "Si",
			title: "Acerca",
			header: "Chance es tu oportunidad de ganar dinero fácil y gratis",
			body: "es un servicio de rifa donde todos pueden participar, basta con ver anuncios para tener más chance de ganar. El premio se sortea cuando el jackpot, hecho de las ganancias de los anuncios y compras, llega a su meta, en donde se escogerá al azar a un solo ganador.",
			facebook: "Accede a nuestro Facebook",
			logout: "Cerrar Sesión",
			termsTitle: "Terminos y Condiciones",
		},
	});

	logoutAlert = [
		this.strings.logoutAlertTitle,
		this.strings.logoutAlertText,
		[
			{text:"No"},
			{text:this.strings.acept, onPress: () => this.logOut()},
		],
	];

	termsAlert = (msg) => {
		return [
			this.strings.termsTitle,
			msg,
			[
				{text:"Ok"},
			],
		];
	};

	static navigationOptions = ({navigation}) => {
		const {params = {}} = navigation.state;
		return {
			title: params.title,
			headerStyle: {backgroundColor:"#F8A42F"},
			headerTintColor: "#FFFFFF",
		};
	};

	constructor(props) {
		super(props);
		this.state = {"user": false};
		this.props.navigation.setParams({
			title: this.strings.title,
		});

		if (this.props.navigation.state.params != null){
			if (this.props.navigation.state.params.user){
				this.state.user = true;
			};
		};

	};

	componentDidMount(){
	};

	componentWillUnmount(){
	};

	logOut(){

		//cambiar pagina
		const resetAction = NavigationActions.reset({
			index: 0,
			actions: [
				NavigationActions.navigate({ routeName: 'Login', params:{disconnect: true}}),
			]
		});
		this.props.navigation.dispatch(resetAction);

	};

	openFacebook(){
		let facebook_url = "https://www.facebook.com/Chance-137419010238633/";
		Linking.canOpenURL("fb://facewebmodal/f?href="+facebook_url).then(supported => {
			if (!supported) {
				return Linking.openURL(facebook_url);
			} else {
				return Linking.openURL("fb://facewebmodal/f?href="+facebook_url);
			}
		}).catch(err => console.error('Linking Error: ', err));
	};

	showTermsAlert(){
		RNFS.readFileAssets("TERMS AND CONDITIONS").then((res) => {
			Alert.alert.apply({}, this.termsAlert(res))
		});
	};

	render() {
		return (

			<View style={{flex:1,backgroundColor: '#FFFFFF'}}>
			<ScrollView>
				<View style={styles.container}>
				
					<Image 
						resizeMode={"contain"}
						style={{width: 180, alignSelf: "center", marginTop: 18,}}
						source={require("../assets/name.png")} />

					<Text style={styles.header}>
						{this.strings.header}
					</Text>

					<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:10}} />

					<Text style={styles.subText}>
						<Text style={{fontSize:17,fontWeight:"bold"}}>Chance</Text> {this.strings.body}
					</Text>

					<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:10}} />

					<View style={{margin:25}}>
						<Icon.Button size={25} name="facebook" backgroundColor="#3b5998" onPress={() => this.openFacebook()}>
							{this.strings.facebook}
						</Icon.Button>
					</View>

					<Button style={{color:"#F8A42F", fontSize:20, margin:5}} onPress={() => this.showTermsAlert()} containerStyle={{marginBottom:15, marginTop:-10}}>
						{this.strings.termsTitle}
					</Button>

					{this.state.user &&
						<Button style={{color:"#F8A42F", fontSize:20}} onPress={() => Alert.alert.apply({}, this.logoutAlert)} containerStyle={{marginBottom:15, marginTop:-10}}>
							{this.strings.logout}
						</Button>
					}

					<Text style={{textAlign:"center"}}>
						<Icon name="copyright"/> Chance Team
					</Text>

				
				</View>
			</ScrollView>
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
	header:{
		fontSize: 20,
		textAlign: 'center',
		margin: 25,
		marginTop: 5,
		fontWeight:"bold",
	},
	subText:{
		fontSize: 15,
		color: "rgb(110,110,110)",
		textAlign: 'center',
		margin: 25,
		marginTop: 18,
		marginBottom: 22,
	},
	jackpotValue:{
		fontSize: 15,
		textAlign: 'center',
		margin: 10,
	},
	footer:{
		bottom:0,
	},

});

module.exports = AboutScreen;
