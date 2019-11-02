const { Worker } = require('worker_threads');

frame = 0;

const worker = new Worker('./dnn-worker.js');
worker.on('message', (msg) => {
	if(msg == 'done' && frame < 100) {
		worker.postMessage(frame);
	}
});
worker.postMessage(frame);
			
function sendFrame() {
	// Recupera frame da OpenCV
	const millis = 100;
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
	while(curDate-date < millis);

	if(frame < 100) {
		frame++;

		console.log(frame);
		setImmediate(sendFrame);
	}
}

setImmediate(sendFrame);