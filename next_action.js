const express = require('express');
const Next_Action_Router = express.Router();
module.exports = Next_Action_Router;

let client = require(`./database.js`)

Next_Action_Router.get('/next_action', async (req, res) => {

    if(req.body.action == "attack") {

        let player = await client.db('ds_db').collection('stats').findOne(
            playerId = req.body.name
        )

        console.log(player)
        //attack action cukup tak?
        //enemy health utk tolak

        if(player.attack_action > 0) {
            console.log("attack")
        } else {
            console.log("Cannot attack")
        }

    } else if(req.body.action == "evade") {

    } else if(req.body.action == "defend") {

    } else {
        res.send("Invalid Action")
    }

})