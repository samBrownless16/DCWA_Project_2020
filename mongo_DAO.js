const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'headsOfStateDB';
const collName = 'headsOfState';

var headStateDB, headStateColl;

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
.then((client) => {
    headStateDB = client.db(dbName);
    headStateColl = headStateDB.collection(collName);
})
.catch((error) => {
    console.log(error);
});

// Query to find all State Leader documents
var getAllStateLeaders = function() {
    return new Promise((resolve, reject) => {
        var cursor = headStateColl.find();
        cursor.toArray()
            .then((documents) => {
                resolve(documents);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Add a State Leader document to database
var addStateLeader = function(_id, stateHead) {
    return new Promise((resolve, reject) => {
        headStateColl.insertOne({"_id": _id, "headOfState": stateHead})
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);                   
            });
    });
}

// Updates a State Leader document (using _id to locate specific document)
var updateStateLeader = function(countryCode, newStateHead) {
    return new Promise((resolve, reject) => {
        headStateColl.updateOne({"_id": countryCode}, {$set: {"headOfState": newStateHead}})
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);                   
            });
    });
}

// Get a specific State Leader document (using _id)
var getSpecificStateLeader = function(countryCode) {
    return new Promise((resolve, reject) => {
        var cursor = headStateColl.find({"_id": countryCode});
        cursor.toArray()
            .then((documents) => {
                resolve(documents);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Delete a State Leader document
var removeStateLeader = function(countryCode) {
    return new Promise((resolve, reject) => {
        headStateColl.deleteOne({"_id": countryCode})
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);                   
            });
    });
}

// Export
module.exports = { getAllStateLeaders, addStateLeader, updateStateLeader, getSpecificStateLeader, removeStateLeader }