import { env } from './environment/environment';
import { MainPage } from './views/main';
import { SettingsPage } from './views/settings';

var express = require('express');
var hbs = require('express-handlebars');
var app = express();
var router = express.Router();

app.use(express.urlencoded({ extended: true }));

const mainPage = new MainPage();
const settingsPage = new SettingsPage();

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

router.get('/settings', function(req, res) {
    settingsPage.render(req, res);
});
router.post('/settings', function(req, res) {
    settingsPage.submit(req, res);
});

router.get('/about', function(req, res) {
	res.render('about', { layout: 'default', aboutActive: 'active' });
});

app.use('/', router);

app.use(
    express.static(__dirname + '/public')
);

app.engine(
	'hbs',
	hbs({
		extname: 'hbs',
		defaultLayout: 'main',
		layoutsDir: __dirname + '/views/layouts/',
		partialsDir: __dirname + '/views/partials/'
	})
);

app.set('view engine', 'hbs');

app.listen(env.httpPort, function() {
	console.log('Server started on port ' + env.httpPort);
});
