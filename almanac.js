const express = require('express');
const AlmanacRouter = express.Router();
module.exports = AlmanacRouter;

let client = require(`./database.js`)

AlmanacRouter.get('/almanac', async (req, res) => {

    let enemies = await client.db('ds_db').collection('almanac').find().toArray();

    res.send(enemies);
})
