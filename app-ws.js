import { env } from './environment/environment';
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});





console.log('Connecting to ' + env.detectionServiceUrl + '...');
const client = new WebSocket(env.detectionServiceUrl);
console.log('Connected');

client.on('open', heartbeat);
client.on('ping', heartbeat);
client.on('close', function clear() {
	clearTimeout(this.pingTimeout);
});

client.on('message', function incoming(data) {
	console.log(data);
});

function heartbeat() {
	clearTimeout(this.pingTimeout);

	this.pingTimeout = setTimeout(() => {
		this.terminate();
	}, env.pingInterval + 1000);
}