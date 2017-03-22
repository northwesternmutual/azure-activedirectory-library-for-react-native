
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Button,
    View,
    ListView,
    Platform
} from 'react-native';
import AuthenticationContext from "./utilities/AuthenticationContext";

var adal = {
    authority: '', //example https://login.windows.net/sample.onmicrosoft.com',
    resourceId: 'https://graph.windows.net/',
    clientId: '',
    iosRedirectUri: 'x-msauth-org-reactjs-native-example-sample://org.reactjs.native.example.sample',
    androidRedirectUri: 'msauth://com.sample/74UlCyG4tDc%2FmNrvI9a5hnx4Tic%3D',
    brokeredAuth: false
};

let redirectUri = Platform.OS === 'ios' ? adal.iosRedirectUri : adal.androidRedirectUri;

export default class AdalComponent extends Component {
    constructor() {
        super();

        this.state = {
            messages: [`${new Date().toLocaleTimeString()}: Sample app started`]
        };
    }

    createAuthContextPressed() {
        AuthenticationContext.createAsync(adal.authority)
            .then((context) => {
                let messages = [`${new Date().toLocaleTimeString()}: Created authentication context`].concat(this.state.messages);

                this.setState({
                    messages: messages,
                    authContext: context
                });

            })
            .catch(err => {
                this.logMessage(`${new Date().toLocaleTimeString()}: Create failed: ${err}`);
            });
    }

    acquireTokenPressed(){

        this.state.authContext.acquireTokenAsync(adal.resourceId, adal.clientId, redirectUri)
            .then(results => {
                this.logMessage(`${new Date().toLocaleTimeString()}: acquire token: ${JSON.stringify(results, null, 4)}`);
            })
            .catch(err => {
                this.logMessage(`${new Date().toLocaleTimeString()}: acquire token failed: ${JSON.stringify(err, null, 4)}`);
            });
    }

    acquireTokenSilentlyPressed() {
        this.state.authContext.acquireTokenSilentAsync(adal.resourceId, adal.clientId, "")
            .then(results => {
                this.logMessage(`${new Date().toLocaleTimeString()}: acquire token silently: ${JSON.stringify(results, null, 4)}`);
            })
            .catch(err => {
                this.logMessage(`${new Date().toLocaleTimeString()}: acquire token silently failed: ${JSON.stringify(err, null, 4)}`);
            });
    }

    readCacheItemsPressed() {
        this.state.authContext.tokenCache.readItems()
            .then((results) => {
                this.logMessage(`${new Date().toLocaleTimeString()}: Read token cache: ${JSON.stringify(results, null, 4)}`);
            })
            .catch(err => {
                this.logMessage(`${new Date().toLocaleTimeString()}: read cache failed: ${JSON.stringify(err, null, 4)}`);
            });
    }

    clearCachePressed() {
        this.state.authContext.tokenCache.clear()
            .then(() => {
                this.logMessage(`${new Date().toLocaleTimeString()}: Cache cleared`);
            })
            .catch(() => {
                this.logMessage(`${new Date().toLocaleTimeString()}: Cache clear failed`);
            })
    }

    logMessage(msg){
        let messages = [msg].concat(this.state.messages);

        this.setState({
            messages: messages
        })
    }

    render() {

        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        let dataSource = ds.cloneWithRows(this.state.messages);

        return (
            <View style={styles.container}>
                <View style={styles.buttons}>
                    <Button title="Create auth context"
                            style={styles.button}
                            onPress={this.createAuthContextPressed.bind(this)}/>
                    <Button title="Acquire token"
                            style={styles.button}
                            onPress={this.acquireTokenPressed.bind(this)}/>
                    <Button title="Acquire token silently"
                            style={styles.button}
                            onPress={this.acquireTokenSilentlyPressed.bind(this)}/>
                    <Button title="Read cache items"
                            style={styles.button}
                            onPress={this.readCacheItemsPressed.bind(this)}/>
                    <Button title="Clear cache"
                            style={styles.button}
                            onPress={this.clearCachePressed.bind(this)}/>
                </View>
                <View>
                    <ListView
                        style={styles.listView}
                        dataSource={dataSource}
                        renderRow={(rowData) => <Text>{rowData}</Text>}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    buttons: {
        marginTop: 20
    },
    button: {
    },
    listView: {
        marginBottom: 220
    },
});

