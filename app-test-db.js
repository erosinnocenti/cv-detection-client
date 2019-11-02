const Datastore = require('nedb')

const db = {};
db.events = new Datastore({ filename: 'database/db.nedb', autoload: true });

var doc = { hello: 'world 123'
               , n: 5
               , today: new Date()
               , nedbIsAwesome: true
               , notthere: null
               , notToBeSaved: undefined  // Will not be saved
               , fruits: [ 'apple', 'orange', 'pear' ]
               , infos: { name: 'nedb' }
               };

// db.events.insert(doc);

db.events.find({ hello: 'world 123' }, (err, docs) => {
    console.log(docs);
});