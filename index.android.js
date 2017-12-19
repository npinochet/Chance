
import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import { AppRegistry, StyleSheet, View } from 'react-native';

import loginScreen from "./js/login";
import homeScreen from "./js/home";
import payScreen from "./js/pay";
import aboutScreen from "./js/about";

const Nav = StackNavigator({
	Login: {screen: loginScreen},
	Home: {screen: homeScreen},
	Pay: {screen: payScreen},
	About: {screen: aboutScreen},
}, {headerMode: 'screen'});


export default class Chance extends Component {
 	render() {
		return (
			<View style={styles.container}>
				<Nav />
			</View >
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
});

AppRegistry.registerComponent('Chance', () => Chance);
