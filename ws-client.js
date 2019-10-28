import { ConfigUtils } from "./config/config-utils";
import { env } from './environment/environment';
const WebSocket = require('ws');

class WSClient {
    static instance = null;
    
    client = null;
    lastError = null;
    uuid = null;

    connected = false;
    streaming = false;

    constructor() {
        this.config = ConfigUtils.getConfig();
    }

    static getInstance() {
        if(this.instance == null) {
            this.instance = new WSClient();
        }

        return this.instance;
    }

    connect(connectCallback) {
        this.connectCallback = connectCallback;

        console.log('Connecting to ' + this.config.wsUrl + '...');
        this.client = new WebSocket(this.config.wsUrl);
        
        this.client.on('error', (error) => {
            console.log(error);

            if(this.uuid == null) {
                connectCallback(error);
            } else {
                this.connected = false;
            }
        });

        this.client.on('open', () => { this.open() });
        this.client.on('close', () => { this.close() });
        this.client.on('message', (data) => { this.messageReceived(data) });
    }

    send(message) {
        if(this.connected == false) {
            return;
        }

        if(message.type == 'START_STREAMING') {
            this.streaming = true;
        }

        if(message.type == 'STOP_STREAMING') {
            this.streaming = false;
        }

        const strMessage = JSON.stringify(message);
        console.log('Sending: ' + strMessage);
        
        this.client.send(strMessage);
    }

    open() {

    }

    close() {
        console.log('Disconnected');
    }

    disconnect(disconnectCallback) {
        if(this.connected == true) {
            if(this.streaming == true) {
                this.send({ type: 'STOP_STREAMING' });
            }

            this.client.close();
            this.connected = false;
        }

        disconnectCallback();
    }

    messageReceived(data) {
        const dataObj = JSON.parse(data);

        if(dataObj.type == 'UUID_ASSIGN') {
            console.log(data);    

            const payload = dataObj.payload;
            this.uuid = payload.uuid;
            this.connected = true;

            this.connectCallback();
        } else if(dataObj.type == 'DETECTION') {
            
        }
    }
}

export { WSClient }