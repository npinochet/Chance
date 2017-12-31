
import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Alert,
} from 'react-native';

import Button from 'react-native-button';
import Hr from 'react-native-hr';
import { AdMobRewarded } from 'react-native-admob';
import InAppBilling from 'react-native-billing';
import Spinner from 'react-native-loading-spinner-overlay';
import PushNotification from 'react-native-push-notification';
import LocalizedStrings from 'react-native-localization';

import client_call from "./client";

class PayScreen extends Component {

	strings = new LocalizedStrings({
		"en":{
			noFillAlertTitle: "No ads available",
			noFillAlertText: "No ads left to watch. Wait a few minutes before trying again.",
			buyErrorAlertTitle: "Error processing the purchase",
			buyErrorAlertText: "There was an error processing the purchase, please notify the app developers.",
			title: "Get More Chance",
			waitAlertTitle: "Wait {0} hours",
			waitAlertText: "You can only watch the ad once every {0} hours.",
			watchAd: "View Ad",
			notifiTitle: "Ad Available",
			notifiText: "Watch the ad now to get more chance.",
			spinner: "Processing Purchase...",
		},
		"es":{
			noFillAlertTitle: "No hay anuncios",
			noFillAlertText: "No quedan anuncios disponibles por ver. Espere unos minutos antes de interntarlo de nuevo.",
			buyErrorAlertTitle: "Error procesando la compra",
			buyErrorAlertText: "Hubo un error procesando la compra, por favor notifique a los desarrolladores de la aplicación.",
			title: "Obtener Más Chance",
			waitAlertTitle: "Espere {0} horas",
			waitAlertText: "Solo se puede ver el anuncio una vez cada {0} horas.",
			watchAd: "Ver Anuncio",
			notifiTitle: "Anuncio Disponible",
			notifiText: "Puedes ver un anuncio ahora para obtener más chance.",
			spinner: "Procesando Compra...",
		},
	});

	lastAdTimer;
	lastAdMili;

	noFillAlert = [
		this.strings.noFillAlertTitle,
		this.strings.noFillAlertText,
		[
			{text:"OK"}
		],
	];

	buyErrorAlert = [
		this.strings.buyErrorAlertTitle,
		this.strings.buyErrorAlertText,
		[
			{text:"OK"}
		],
	];

	loaded = false;

	static navigationOptions = ({navigation}) => {
		const {params = {}} = navigation.state;
		return {
			title: params.title,
			headerStyle: {backgroundColor:"#F8A42F"},
			headerTintColor: "#FFFFFF",
		};
	};

	constructor(props) {
		// params:{"user": user}
		super(props);
		this.user = this.props.navigation.state.params.user;
		this.adHours = this.props.navigation.state.params.adHours;
		this.props.navigation.setParams({
			title: this.strings.title,
		});

		this.WaitAdAlert = [
			this.strings.formatString(this.strings.waitAlertTitle, this.adHours),
			this.strings.formatString(this.strings.waitAlertText, this.adHours),
			[
				{text:"OK"}
			],
		];

		this.state = {
			waitAd: true,
			spinnerVisible: false,
		};

		this.product_ids = ["20", "50", "300", "800"];
		this.items = [{"adText": this.strings.watchAd, "productId": "AD"}];
		InAppBilling.open().then(() => InAppBilling.getProductDetailsArray(this.product_ids)).then((details) => {
			details.sort((a,b) => parseInt(a.productId)-parseInt(b.productId));
			this.items = this.items.concat(details);
			console.log(details);
			return InAppBilling.close();
		}).catch((error) => {
			console.log("Billing Error: "+error);
			Alert.alert.apply({}, this.buyErrorAlert);
			return InAppBilling.close();
		});

		AdMobRewarded.setAdUnitID('ca-app-pub-9796530573307706/9284443179');

		PushNotification.configure({
			// (required) Called when a remote or local notification is opened or received
			onNotification: function(notification) {
				console.log( 'NOTIFICATION:', notification );
			},
		});

	};

	componentDidMount() {

		this.items[0].adText = this.strings.watchAd;
		this.updateAdTime();

		AdMobRewarded.addEventListener('rewarded', (type, amount) => {
			console.log('rewarded', type, amount);

			this.setState((prevState) => {return {waitAd: true}});
			client_call("get", "ad", {"email":this.user.email}, (data) => {
				if (data.date){
					this.updateAdTime(data.date);
				}else{
					this.updateAdTime();
					//rewardVideoError: ServerError: {"chance":false}
					console.log("rewardVideoError: ServerError: "+JSON.stringify(data));
				};
			});

			// notification in X hours...
			PushNotification.localNotificationSchedule({
				color: "#F8A42F", // (optional) default: system default
				title: this.strings.notifiTitle, // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
				message: this.strings.notifiText, // (required)
				date: new Date(Date.now() + this.adHours*(1000*60*60)) // X horas
			});

		});

		AdMobRewarded.addEventListener('adLoaded',() => {
			console.log('adLoaded');
		});

		//ERROR_CODE_INVALID_REQUEST
		AdMobRewarded.addEventListener('adFailedToLoad',(error) => { 
			console.log('adFailedToLoad', error);
			if (error == "ERROR_CODE_NO_FILL"){
				Alert.alert.apply({}, this.noFillAlert);
			};
		});

		AdMobRewarded.addEventListener('adOpened', () => {
			console.log('adOpened');
		});

		AdMobRewarded.addEventListener('adClosed', () => {
			console.log('adClosed');
			//cerrar sin la recompensa
			AdMobRewarded.requestAd().catch(error => console.log(error));
		});

		AdMobRewarded.addEventListener('adLeftApplication', () => {
			console.log('adLeftApplication');
		});

		AdMobRewarded.requestAd().catch(error => console.log(error));

		this.loaded = true;

	};

	componentWillUnmount(){
		clearInterval(this.lastAdTimer);
		AdMobRewarded.removeAllListeners();
		this.loaded = false;
		this.props.navigation.state.params.home.componentDidMount();
	};

	buyPress(item){

		console.log("Selected Item: "+JSON.stringify(item));

		if (item.productId == "AD"){

			if (this.state.waitAd == false){
				AdMobRewarded.isReady((ready) => {
					if (ready){
						AdMobRewarded.showAd().catch(error => console.log(error));
					}else{
						Alert.alert.apply({}, this.noFillAlert);
					};
				});
			}else{
				if (this.loaded){
					Alert.alert.apply({}, this.WaitAdAlert);
				};
			};

		}else{

			InAppBilling.open().then(() => InAppBilling.purchase(item.productId)).then((details) => {

				this.setState((prevState) => {
					prevState.spinnerVisible = true;
					return prevState;
				});

				client_call("post", "buy", {"email": this.user.email, "details":details, "item": item}, (confirmed) =>{
					console.log(details);

					if (confirmed){

						this.setState((prevState) => {
							prevState.spinnerVisible = false;
							return prevState;
						});

						this.props.navigation.goBack();
					}else{
						console.log("Confirmacion Error: "+confirmed);
						Alert.alert.apply({}, this.buyErrorAlert);
					};

				});
				
				InAppBilling.consumePurchase("android.test.purchased").then((consumed) =>{
					if (consumed == false){
						console.log("Consumed Error: "+consumed);
						Alert.alert.apply({}, this.buyErrorAlert);
						this.setState((prevState) => {
							prevState.spinnerVisible = false;
							return prevState;
						});
					};
				});
				return InAppBilling.close();
			}).catch((error) => {
				console.log("Billing Error: "+error);
				Alert.alert.apply({}, this.buyErrorAlert);
				this.setState((prevState) => {
					prevState.spinnerVisible = false;
					return prevState;
				});
				return InAppBilling.close();
			});
		};
	};

	updateAdTime(watch){

		up = () => {
			let t = this.parseTime(this.lastAdMili);

			let timeText = (t.seconds%60)+"s";
			if (t.minutes%60 != 0){
				timeText = (t.minutes%60)+"m "+timeText;
			};
			if (t.hours != 0){
				timeText = (t.hours)+"h "+timeText;
			};

			this.items[0].adText = timeText;
			this.setState((prevState) => {return {waitAd: true}});
			
			this.lastAdTimer = setInterval(()=>{
				this.lastAdMili = this.lastAdMili - 1000;

				let t = this.parseTime(this.lastAdMili);

				let timeText = (t.seconds%60)+"s";
				if (t.minutes%60 != 0){
					timeText = (t.minutes%60)+"m "+timeText;
				};
				if (t.hours != 0){
					timeText = (t.hours)+"h "+timeText;
				};

				this.items[0].adText = timeText;
				this.setState((prevState) => {return {waitAd: true}});

				if (this.adHours <= 0){
					clearInterval(this.lastAdTimer);
					this.updateAdTime();
				};

			}, 1000);
		};

		if (watch){
			this.lastAdMili = this.adHours*(1000*60*60);
			up();
		}else{
			client_call("get", "lastTimeAd", {"email":this.user.email}, (data) => {
				if (data.mili){
					this.lastAdMili = data.mili;
					up();
				}else{
					this.items[0].adText = this.strings.watchAd;
					this.setState((prevState) => {
						return {waitAd: false};
					});
				};
			});
		};

	};

	parseTime(t){
		var seconds = Math.floor((t/1000));
		var minutes = Math.floor((t/1000/60));
		var hours = Math.floor((t/(1000*60*60)));
		var days = Math.floor(t/(1000*60*60*24));
		return {'total': t,'days': days,'hours': hours,'minutes': minutes,'seconds': seconds};
	};

	renderItems(info){

		printItem = (item, text, Cont, multi) => {
			return (<View>
				<View style={styles.itemContainer}>
					<Text style={styles.chanceText}>
					Chance + x{multi}
					</Text>
					<Button style={styles.buyButton} onPress={() => this.buyPress(item)} containerStyle={Cont}>
					{text}
					</Button>
				</View>
			</View>)
		};

		const {item, index} = info;

		if (index == 0){
			let ContStyle = styles.buyButtonContainer;
			if (this.state.waitAd){
				ContStyle = styles.buyButtonWait;
			};
			return printItem(item, item.adText, ContStyle, 1);
		}else{
			let price = item.priceText
			if (item.currency != "USD"){
				price = price+" "+item.currency;
			};
			return (<View>
				<Hr lineStyle={{backgroundColor:"#AAAAAA",marginHorizontal:10}}/>
				{printItem(item, price, styles.buyButtonContainer, item.productId)}
			</View>)
		};
	};

	render() {
		return (
			<View style={styles.container}>

				<Spinner overlayColor="rgba(0, 0, 0, 0.7)" size={60} visible={this.state.spinnerVisible} textContent={this.strings.spinner} textStyle={{color: '#FFF', textAlign: 'center'}}/>
				<FlatList extraData={this.state} keyExtractor={(item, index) => index} data={this.items} renderItem={(info) => this.renderItems(info)} />

			</View>
		);
	};
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
	},
	itemContainer: {
		flex: 1,
		justifyContent: 'space-between',
		flexDirection: 'row',
	},
	chanceText:{
		fontSize: 25,
		textAlign: 'center',
		margin: 20,
		paddingTop:2,
	},
	buyButton:{
		fontSize: 15,
		margin:10,
		color: 'white',
		textAlign: 'center',
	},
	buyButtonContainer:{
		borderRadius:5,
		justifyContent: 'center',
		backgroundColor: '#F8A42F',
		margin:20,
	},
	buyButtonWait:{
		borderRadius:5,
		justifyContent: 'center',
		backgroundColor: 'gray',
		margin:20,
	},

});

module.exports = PayScreen;
