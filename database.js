// const MongoClient = require('mongodb').MongoClient
// let url = "mongodb+srv://ds_dev:ds_devgroupb@clusterds.imsywsc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDS"

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ds_dev:ds_devgroupb@clusterds.imsywsc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDS";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = client

// let connection

// module.exports = function() {

//    return new Promise((resolve, reject) => {

//       if (connection)

//          resolve(connection)

//       MongoClient.connect(url, (err, db) => {

//          if (err)

//             reject(err)

//          connection = db
//          console.log(connection)
//          resolve(connection) 
//       })
//    })
// }