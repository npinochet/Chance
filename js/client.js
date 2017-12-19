
import {Alert,BackHandler} from 'react-native';
import LocalizedStrings from 'react-native-localization';

export function client_call(method,action, params, callback){

	strings = new LocalizedStrings({
		"en":{
			errorAlertTitle: "An error ocurred connecting to the server. The server may not be available.",
		},
		"es":{
			errorAlertTitle: "Ocurrio un problema conectandose con el servidor. Puede que el servidor no este disponible.",
		},
	});

	const url = "https://chance-lotto-server.herokuapp.com/";

	const errorAlert = [
		"Error",
		this.strings.errorAlertTitle,
		[
			{text:"Ok", onPress: () => BackHandler.exitApp()},
		],
		{cancelable: false},
	];

	var options = {
		method: method.toUpperCase(),
		headers: {'Content-Type': 'application/json'}
	};

	if (options.method == "GET"){
		action = action + "?";
		Object.keys(params).forEach((key)=>{
			action = action + key + "=" + String(params[key]) + "&";
		});
		action = action.slice(0, -1);
	}else{
		options.body = JSON.stringify(params);
	};

	fetch(url+action, options).then((res) => {
		console.log(res.status);
		res.json().then((data) => {
			callback(data);
		}).catch((error, err) => {
			console.log(url+action);
			console.log("Client Error: "+error);
			Alert.alert(errorAlert[0], errorAlert[1]+"\n"+error, errorAlert[2], errorAlert[3]);
		});
	}).catch((error, err) => {
		console.log(url+action);
		console.log("Client Error: "+error);
		Alert.alert(errorAlert[0], errorAlert[1]+"\n"+error, errorAlert[2], errorAlert[3]);
	});

};

module.exports = client_call;
