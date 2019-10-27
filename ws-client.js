import { ConfigUtils } from "./config/config-utils";
const WebSocket = require('ws');

class WSClient {
    static instance = null;
    
    client = null;
    connected = false;

    lastError = null;

    constructor() {
        this.config = ConfigUtils.getConfig();
    }

    static getInstance() {
        if(this.instance == null) {
            this.instance = new WSClient();
        }

        return this.instance;
    }

    connect(callback) {
        console.log('Connecting to ' + this.config.wsUrl + '...');
        this.client = new WebSocket(this.config.wsUrl);
        
        this.client.on('error', (error) => {
            console.log(error);
            callback(error);
        });

        this.client.on('open', () => { this.open(callback) });
        this.client.on('ping', this.heartbeat);
        this.client.on('close', function clear() {
            clearTimeout(this.pingTimeout);
        });
        this.client.on('message', this.messageReceived);
    }

    open(callback) {
        console.log('Connected');
        callback('Connected');
        
        this.connected = true;
        this.heartbeat();
    }

    messageReceived(data) {
        console.log(data);    
    }
 
    heartbeat() {
        clearTimeout(this.pingTimeout);

        this.pingTimeout = setTimeout(() => {
            this.terminate();
        }, env.pingInterval + 1000);
    }
}

export { WSClient }