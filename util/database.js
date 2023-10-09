require('dotenv').config();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (callback) => {
  MongoClient.connect(
    process.env.DATABASE
  ).then((client) => {
    _db = client.db()
    console.log("Connected!");
    callback(client);
  }).catch((err) => {
    console.log(err);
    throw err;
  })
};

const getDb = () => {
  if(_db) {
    return _db;
  };
  throw 'No database connect';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
