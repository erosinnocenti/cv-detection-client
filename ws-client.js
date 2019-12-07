import { ConfigUtils } from "./config/config-utils";
import { Point } from "./utils/point";
import { GeometryUtils } from "./utils/geometry-utils";
import { WSServer } from "./ws-server";
import { DBService } from "./db-service";
const WebSocket = require('ws');

let instance = null;

const lastState = {
    alarm: false,
    safePeopleCount: 0,
    unsafePeopleCount: 0
}

class WSClient {    
    client = null;
    lastError = null;
    uuid = null;

    connected = false;
    streaming = false;
    detectionsBuffer = [];

    wsServer = null;

    line = null;

    constructor() {
        this.config = ConfigUtils.getConfig();
    }

    static getInstance() {
        if(instance == null) {
            instance = new WSClient();
        }

        return instance;
    }

    connect(connectCallback) {
        this.connectCallback = connectCallback;
        instance = this;

        console.log('Connecting to ' + this.config.wsUrl + '...');
        this.client = new WebSocket(this.config.wsUrl);
        
        this.client.on('error', (error) => {
            console.log(error);

            if(this.uuid == null) {
                connectCallback(error);
            } else {
                this.connected = false;
            }
        });

        this.wsServer = WSServer.getInstance();

        this.client.on('open', () => { this.open() });
        this.client.on('close', () => { this.close() });
        this.client.on('message', (data) => { this.messageReceived(data) });
    }

    send(message) {
        if(this.connected == false) {
            return;
        }

        if(message.type == 'START_STREAMING') {
            this.line = {
                start: new Point(this.config.lineStartX, this.config.lineStartY),
                end: new Point(this.config.lineEndX, this.config.lineEndY),
                forbiddenArea: this.config.lineForbiddenArea
            };

            this.streaming = true;
        }

        if(message.type == 'STOP_STREAMING') {
            this.streaming = false;
        }

        const strMessage = JSON.stringify(message);
        console.log('Sending: ' + strMessage);
        
        this.client.send(strMessage);
    }

    open() {
        console.log('Connected');
    }

    close() {
        console.log('Disconnected');
    }

    disconnect(disconnectCallback) {
        if(this.connected == true) {
            if(this.streaming == true) {
                this.send({ type: 'STOP_STREAMING' });
            }

            this.client.close();
            this.connected = false;
        }

        disconnectCallback();
    }

    messageReceived(data) {
        const dataObj = JSON.parse(data);

        if(dataObj.type == 'UUID_ASSIGN') {
            console.log(data);    

            const payload = dataObj.payload;
            this.uuid = payload.uuid;
            this.connected = true;

            this.connectCallback();
        } else if(dataObj.type == 'DETECTION') {
        
            let alarm = false;
            let safePeopleCount = 0;
            let unsafePeopleCount = 0;

            // Verifica collisioni
            for(let person of dataObj.payload.detections) {
                this.addCalculations(person);

                if(person.alarm) {
                    alarm = true;
                    unsafePeopleCount++;
                } else {
                    safePeopleCount++;
                }
            }

            // Lo stato è cambiato da normale ad allarme
            if(!lastState.alarm && alarm) {
                // TODO: azionare attuatore
                console.log('Stato allarme');
            }

            // Lo stato è cambiato da allarme a normale
            if(lastState.alarm && !alarm) {
                // TODO: spegnere attuatore
                console.log('Stato non in allarme')
            }

            // Stato di allarme cambiato
            if(lastState.alarm != alarm) {
               var event = { 
                   date: new Date(),
                   people: (safePeopleCount + unsafePeopleCount),
                   safePeople: safePeopleCount,
                   unsafePeople: unsafePeopleCount,
                   alarm: alarm,
                };

                DBService.getInstance().addEvent(event);
            }

            // Reimpostazione lastState
            lastState.alarm = alarm;
            lastState.safePeopleCount = safePeopleCount;
            lastState.unsafePeopleCount = unsafePeopleCount;

            // Aggiunta risultati al buffer per il client
            this.detectionsBuffer.push(dataObj.payload);

            // Invio del messaggio in broadcast ai client (WebSocket) - sincrono
            this.wsServer.broadcast(this.detectionsBuffer);
            this.detectionsBuffer.splice(0, this.detectionsBuffer.length);
        }
    }

    addCalculations(person) {
        const side = this.line.forbiddenArea;
        const line = this.line;

        // Conversione punti ricevuti, Yolo usa come x, y il centro del box
        // mentre risulta più comodo avere l'angolo superiore sx per il canvas html5
        person.box.x = person.box.x - (person.box.w / 2);
        person.box.y = person.box.y - (person.box.h / 2);

        // Calcolo punto di riferimento (centrale alla linea inferiore del box)
        const middleLowerPoint = new Point( 
            person.box.x + (person.box.w / 2),
            person.box.y + person.box.h
        );

        person.refPoint = middleLowerPoint;

        // Calcolo punto piu vicino della linea di riferimento
        person.lineClosestPoint = GeometryUtils.closestPointToSegment(person.refPoint, line.start, line.end);

        // Calcolo la distanza dalla linea
        person.lineDistance = GeometryUtils.distance(person.refPoint, person.lineClosestPoint);

        // Distanza minima per la segnalazione
        const minDistance = this.config.minDistance;

        switch(side) {
            case 'LEFT':
                if(person.refPoint.x - minDistance < person.lineClosestPoint.x) {
                    person.alarm = true;
                }
            break;
            case 'RIGHT':
                if(person.refPoint.x + minDistance > person.lineClosestPoint.x) {
                    person.alarm = true;
                }
            break;
            case 'UP':
                if(person.refPoint.y - minDistance < person.lineClosestPoint.y) {
                    person.alarm = true;
                }
            break;
            case 'DOWN':
                if(person.refPoint.y + minDistance > person.lineClosestPoint.y) {
                    person.alarm = true;
                }
            break;
        }

        
    }
}

export { WSClient }