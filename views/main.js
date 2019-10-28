import { ConfigUtils } from '../config/config-utils';
import { WSClient } from '../ws-client';

class MainPage {
    wsClient = WSClient.getInstance();

    render(req, res) {
        const config = ConfigUtils.getConfig();

        let message = '';
        let connectBtnTitle = '';
        if(this.wsClient.connected == false) {
            // Client disconnesso
            message = 'Disconnesso';
        } else {
            // Client connesso
            if(this.wsClient.uuid != null) {
                message = 'Connesso con ID ' + this.wsClient.uuid;
            } else {
                message = 'ID non valido';
            }
        }

        const params = {
            layout: 'default',
            mainActive: 'active',
            config: config,
            message: message,
            streaming: this.wsClient.streaming,
            connected: this.wsClient.connected
        }

        res.render('main', params);
    }

    submit(req, res) {
        if(req.body.action == 'connect') {
            // Connessione WS
            if(this.wsClient.connected == false) {
                this.wsClient.connect(() => {
                    this.render(req, res);
                });
            }

            // Disconnessione WS
            if(this.wsClient.connected == true) {
                this.wsClient.disconnect(() => {
                    this.render(req, res);
                });
            }
        }

        if(req.body.action == 'start') {
            // Start streaming
            const startStreamingMessage = {
                type: 'START_STREAMING',
                payload: {}
            };

            this.wsClient.send(startStreamingMessage);
            this.render(req, res);
        }

        if(req.body.action == 'stop') {
            // Stop streaming
            const stopStreamingMessage = {
                type: 'STOP_STREAMING',
                payload: {}
            };

            this.wsClient.send(stopStreamingMessage);
            this.render(req, res);
        }
    }
}

export { MainPage }