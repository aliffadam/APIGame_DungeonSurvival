const express = require('express')
const router = express.Router()

var getMongoDbConnection = require('./database.js')

router.get('/testlagi', async (req, res) => {

    // try {
    //     let db = await getMongoDbConnection()
    // } catch (error) {
    //     res.send(`Unable connect DB`)
    //     return
    // }

    let client = await getMongoDbConnection

    client.db(`ds_db`).collection(`almanac`).insertOne(
        {
            subject: `testkedua`,
            success: `alsotrue`
        }
    )

    //let result = await //client.db('ds_db').collection('almanac')

    res.send(`Successful`)
})

module.exports = router