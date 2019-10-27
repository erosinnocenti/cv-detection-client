import { ConfigUtils } from '../config/config-utils';

class SettingsPage {
    config = {};
    
    render(req, res) {
        this.config = ConfigUtils.getConfig();

        const params = {
            layout: 'default',
            settingsActive: 'active',
            config: this.config
        }

        res.render('settings', params);
    }

    submit(req, res) {
        this.config.wsUrl = req.body.wsUrl;
        
        ConfigUtils.saveConfig(this.config);

        this.render(req, res);
    }
}

export { SettingsPage }