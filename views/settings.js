import { ConfigUtils } from '../config/config-utils';

class SettingsPage {
    config = {};
    
    render(req, res) {
        this.config = ConfigUtils.getConfig();

        const params = {
            layout: 'default',
            settingsActive: 'active',
            sendImages: this.config.sendImages ? this.config.sendImages : null,
            config: this.config,
            left: this.config.lineForbiddenArea == 'LEFT',
            right: this.config.lineForbiddenArea == 'RIGHT',
            up: this.config.lineForbiddenArea == 'UP',
            down: this.config.lineForbiddenArea == 'DOWN'
        }

        res.render('settings', params);
    }

    submit(req, res) {
        this.config.wsUrl = req.body.wsUrl;
        this.config.lineStartX = req.body.lineStartX;
        this.config.lineStartY = req.body.lineStartY;
        this.config.lineEndX = req.body.lineEndX;
        this.config.lineEndY = req.body.lineEndY;
        this.config.lineForbiddenArea = req.body.lineForbiddenArea;
        this.config.sendImages = req.body.sendImages == 'on';
        this.config.minDistance = new Number(req.body.minDistance);
        
        ConfigUtils.saveConfig(this.config);

        this.render(req, res);
    }
}

export { SettingsPage }