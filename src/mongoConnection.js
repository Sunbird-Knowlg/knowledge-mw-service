var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var dbName = '';
var isMongooseConnected = false;

if (process.env.sunbird_mongo_ip && process.env.sunbird_mongo_port) {
    dbName = "mongodb://" + process.env.sunbird_mongo_ip + ":" + process.env.sunbird_mongo_port + "/sunbird";
} else {
    dbName = "mongodb://localhost/sunbird";
}

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    isMongooseConnected = false;
    console.log('Mongoose disconnected');
});

// When the connection is reconnected
mongoose.connection.on('reconnected', function () {
    isMongooseConnected = true;
    console.log('Mongoose reconnected');
});

var getConnectionStatus = function () {
    return isMongooseConnected;
};

var stablishMongoDBConnection = function (callback) {
    
    mongoose.connect(dbName, {auto_reconnect: false}).then(function () {
        isMongooseConnected = true;
        return callback(null, isMongooseConnected);
    }).catch(function (err) {
        isMongooseConnected = false;
        return callback(err, isMongooseConnected);
    });
};

stablishMongoDBConnection(function () {});

module.exports.getConnectionStatus = getConnectionStatus;
module.exports.stablishMongoDBConnection = stablishMongoDBConnection;
