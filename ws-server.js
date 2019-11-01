import { ConfigUtils } from "./config/config-utils";
import { env } from './environment/environment';
const WebSocket = require('ws');

let instance = null;

class WSServer {
    clientStates = [];
    config  = null;
    
    constructor() {
        this.config = ConfigUtils.getConfig();
        instance = this;

        const wss = new WebSocket.Server({ port: env.wsPort });
        console.log('WebSocket server started on port ' + env.wsPort);

        wss.on('connection', (ws, req) => {
            console.log('New client connected (' + req.connection.remoteAddress + ')');

            this.clientStates.push(ws);

            ws.on('close', () => {
                console.log('Client disconnected');

                this.clientStates.pop(ws);
            });
        });
    }

    static getInstance() {
        if(instance == null) {
            instance = new WSServer();
        }

        return instance;
    }

    broadcast(message) {
        for (const client of this.clientStates) {
            client.send(JSON.stringify(message));
        }          
    }
}

export { WSServer }