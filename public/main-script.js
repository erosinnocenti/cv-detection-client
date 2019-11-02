detectionsCount = 0;
getDetectionsInterval = null;
lastClickedPoint = { x: 0, y: 0};
params = null;

function toggleStreaming(connected, streaming) {
    if(connected == 'false') {
        $('#errorModalTitle').text('Errore');
        $('#errorModalContent').text('Connettere il client prima di iniziare lo streaming');
        $('#errorModal').modal('show');
    } else {
        if(streaming == 'true') {
            $('#streamingForm input[name=action]').val('stop');

            detectionsCount = 0;
        } else {
            $('#streamingForm input[name=action]').val('start');
        }

        $('#streamingForm').submit();
    }
};

function toggleConnect(connected, streaming) {
    if(connected == 'true' && streaming == 'true') {
        $('#errorModalTitle').text('Errore');
        $('#errorModalContent').text('Interrompere lo streaming prima di disconnettere il client');
        $('#errorModal').modal('show');
    } else {
        $('#connectForm').submit();
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    params = JSON.parse($('#params').val());

    if(params.connected && params.streaming) {
        $("#detectionsContainer").css({ display: "block" });

        // getDetectionsAjax();
        getDetectionsWs();
    }
});

function getCursorPosition(e) {
    const canvas = document.getElementById("drawCanvas");

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const aspectRatio = (canvas.width / canvas.height);
    
    document.getElementById('lastPoint').textContent = 'X: ' + (x * aspectRatio).toFixed(0) + ' Y: ' + (y * aspectRatio).toFixed(0);
}

function getDetectionsWs() {
    const url = window.location.origin.replace(params.env.httpPort, params.env.wsPort).replace('http://', 'ws://');
    const wsClient = new WebSocket(url);

    wsClient.onopen = function(e) {
        console.log('WebSocket connected');
    }

    wsClient.onmessage = function(event) {
        elaborateDetections(event.data);
    };
}

async function elaborateDetections(data) {
    const result = JSON.parse(data);

    console.log(result);

    let count = 0;
    
    let lastDetectedFrame = null;
    for(det of result) {
        count = count + det.detections.length;
        
        fps = fps + det.fps;

        lastDetectedFrame = det;
    }

    if(lastDetectedFrame != null) {
        const fps = lastDetectedFrame.fps;
        $('#fps').text(fps.toFixed(2));
    }

    detectionsCount = detectionsCount + count;
    
    $('#detectionsCount').text(detectionsCount);

    // Rappresentazione grafica dell'ultimo risultato
    if(lastDetectedFrame != null) {
        const canvas = document.getElementById("drawCanvas");

        if(canvas.width != lastDetectedFrame.size.w) {
            canvas.width = lastDetectedFrame.size.w;
            canvas.height = lastDetectedFrame.size.h;

            const aspectRatio = (lastDetectedFrame.size.w / lastDetectedFrame.size.h);

            const maxWidth = 1000;

            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxWidth / aspectRatio) + 'px';
        }

        if (canvas.getContext) {
            const ctx = canvas.getContext('2d');

            // Disegna l'immagine, se presente
            if(params.config.sendImages == true && lastDetectedFrame.image !== undefined) {
                const image = new Image();
                await new Promise(
                    function(resolve, reject) {
                        image.onload = function() {
                            ctx.drawImage(image, 0, 0, lastDetectedFrame.size.w, (lastDetectedFrame.size.h));   
                            resolve();
                        };      
                        image.src = lastDetectedFrame.image;
                    }
                );
            } else {
                // Pulisce il contenuto
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // Disegna la linea di riferimento
            ctx.lineWidth = '3';
            ctx.strokeStyle = 'blue';

            ctx.beginPath();
            ctx.moveTo(params.config.lineStartX, params.config.lineStartY);
            ctx.lineTo(params.config.lineEndX, params.config.lineEndY);
            ctx.stroke();

            // Disegna i rettangoli
            ctx.lineWidth = '3';
            
            for(person of lastDetectedFrame.detections) {
                ctx.lineWidth = '3';
                
                // Box
                if(person.alarm == true) {
                    ctx.strokeStyle = 'red';
                } else {
                    ctx.strokeStyle = 'lime';
                }
                ctx.strokeRect(person.box.x, person.box.y, person.box.w, person.box.h);
                
                // Probabilità
                ctx.fillStyle = 'fuchsia';
                ctx.font = '14px sans-serif';
                ctx.fillText(person.prob.toFixed(2), person.box.x, person.box.y - 10);

                // Punto di riferimento
                ctx.fillStyle = 'red';
                ctx.fillRect(person.refPoint.x - 3, person.refPoint.y - 3, 6, 6);

                // Linea da punto di riferimento a retta
                if(person.alarm == true) {
                    ctx.strokeStyle = 'red';
                    ctx.fillStyle = 'red';
                } else {
                    ctx.strokeStyle = 'lime';
                    ctx.fillStyle = 'lime';
                }
                
                ctx.save();
                ctx.lineWidth = '1';
                ctx.setLineDash([7]);
                ctx.beginPath();
                ctx.moveTo(person.refPoint.x, person.refPoint.y);
                ctx.lineTo(person.lineClosestPoint.x, person.lineClosestPoint.y);
                ctx.stroke();
                ctx.restore();

                // Testo distanza
                ctx.font = '16px sans-serif';
                ctx.fillText(person.lineDistance.toFixed(2), person.lineClosestPoint.x, person.lineClosestPoint.y - 10);
            }
        }
    }
}