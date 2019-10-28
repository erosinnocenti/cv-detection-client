detectionsCount = 0;
getDetectionsInterval = null;

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
    const params = JSON.parse($('#params').val());

    if(params.connected && params.streaming) {
        $("#detectionsContainer").css({ display: "block" });

        getDetections();
    }
});

function getDetections() {
    const params = JSON.parse($('#params').val());

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            const result = JSON.parse(xhr.responseText);

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
                canvas.width = lastDetectedFrame.size.w;
                canvas.height = lastDetectedFrame.size.h;

                const aspectRatio = (lastDetectedFrame.size.w / lastDetectedFrame.size.h);

                const maxWidth = 1000;

                canvas.style.width = maxWidth + 'px';
                canvas.style.height = (maxWidth / aspectRatio) + 'px';
                
                if (canvas.getContext) {
                    const ctx = canvas.getContext('2d');
                    ctx.lineWidth = '3';
                    ctx.strokeStyle = 'red';
 
                    // Pulisce il contenuto
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Disegna i rettangoli
                    for(person of lastDetectedFrame.detections) {
                        ctx.strokeRect(person.box.x, person.box.y, person.box.w, person.box.h);
                    }
                }
            }

            setTimeout(getDetections, 100);
        }
    };
    xhr.open('GET', '/getDetections');
    xhr.send();
}