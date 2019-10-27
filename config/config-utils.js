import { env } from '../environment/environment';
var fs = require('fs');

class ConfigUtils {
    static getConfig() {
        let config = {};

        const settingsContents = fs.readFileSync(env.configFile, 'utf8');
        if(settingsContents !== undefined) {
            config = JSON.parse(settingsContents);
        }

        return config;
    }

    static saveConfig(config) {
        const serializedConfig = JSON.stringify(config, null, 4);
        fs.writeFileSync(env.configFile, serializedConfig);
    }
}

export { ConfigUtils }