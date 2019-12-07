import { env } from './environment/environment';
import { MainPage } from './views/main';
import { WSServer } from './ws-server';
import { SettingsPage } from './views/settings';
import { EventsPage } from './views/events';

var compression = require('compression');
var express = require('express');
var hbs = require('express-handlebars');
var helpers = require('handlebars-helpers')();
var app = express();
var router = express.Router();

app.use(express.urlencoded({ extended: true }));
app.use(compression());

const mainPage = new MainPage();
const settingsPage = new SettingsPage();
const eventsPage = new EventsPage();

router.use(function(req, res, next) {
	console.log('/' + req.method);
	next();
});

router.get('/', function(req, res) {
	mainPage.render(req, res);
});
router.post('/', function(req, res) {
	mainPage.submit(req, res);
});
router.get('/getDetections', function(req, res) {
	mainPage.getDetections(res, req);
});

router.get('/settings', function(req, res) {
    settingsPage.render(req, res);
});
router.post('/settings', function(req, res) {
    settingsPage.submit(req, res);
});

router.get('/events', function(req, res) {
	eventsPage.render(req, res);
});
router.post('/events', function(req, res) {
    eventsPage.submit(req, res);
});

app.use('/', router);

app.use(
    express.static(__dirname + '/public')
);

app.engine(
	'hbs',
	hbs({
		extname: 'hbs',
		defaultLayout: 'default',
		layoutsDir: __dirname + '/views/layouts/',
		partialsDir: __dirname + '/views/partials/'
	})
);

app.set('view engine', 'hbs');

// Avvio server HTTP
app.listen(env.httpPort, function() {
	console.log('HTTP server started on port ' + env.httpPort);
});

// Avvio server WebSocket
new WSServer();