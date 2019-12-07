const Datastore = require('nedb')

export class DBService {   
    db = {};

    static instance = null;
    
    constructor() {
        this.db.events = new Datastore({ filename: 'database/db.nedb', autoload: true });
    }

    static getInstance() {
        if(this.instance == null) {
            this.instance = new DBService();
        }

        return this.instance;
    }

    addEvent(document) {
        // Storicizzazione evento su db
        this.db.events.insert(document);
    }

    clearEvents() {
        return new Promise((resolve, reject) => {
            this.db.events.remove({}, { multi: true }, function (err, numRemoved) {
                if(err) {
                    reject(err);
                }

                resolve(numRemoved);
            });
        });
    }

    getEvents() {
        return new Promise((resolve, reject) => {
            this.db.events.find({}).sort({date: -1}).exec((err, docs) => {
                if(err) {
                    reject(err);
                }

                resolve(docs);
            });
        });
    }
}