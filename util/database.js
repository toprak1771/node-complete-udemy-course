const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const mongoConnect = async (callback) => {
  MongoClient.connect(
    "***"
  ).then((client) => {
    console.log("Connected!");
    callback(client);
  }).catch((err) => {
    console.log(err);
  })
};

module.exports = mongoConnect;
