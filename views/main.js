import { ConfigUtils } from '../config/config-utils';
import { WSClient } from '../ws-client';

class MainPage {
    wsClient = WSClient.getInstance();

    message = null;
    
    render(req, res) {
        const config = ConfigUtils.getConfig();

        const params = {
            layout: 'default',
            mainActive: 'active',
            config: config,
            message: this.message,
            connected: this.wsClient.connected
        }

        res.render('main', params);
    }

    submit(req, res) {
        if(req.body.connect !== undefined) {
            // Connessione WS
            this.wsClient.connect((message) => {
                this.message = message;
                this.render(req, res);

                this.message = '';
            });
        }
    }
}

export { MainPage }