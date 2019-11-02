const { workerData, parentPort } = require('worker_threads')

parentPort.on('message', (frame) => {
    console.log('Received frame: ' + frame);

    const millis = 500;
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
    while(curDate-date < millis);
    
    parentPort.postMessage('done');
});