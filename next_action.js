const express = require('express');
const Next_Action_Router = express.Router();
module.exports = Next_Action_Router;

let client = require(`./database.js`)

Next_Action_Router.get('/next_action', async (req, res) => {

    let player = await client.db('ds_db').collection('stats').findOne(
        {
            playerId: req.body.playerId
        }
    )

    console.log(player)

    if(!player) {
        res.send('Could not find your player')
        return
    }

    if(req.body.action == "attack") {

        console.log(player)
        //attack action cukup tak?
        //enemy health utk tolak

        if(player.attack_action > 0) {
            res.send("attack")

            let after_player_action = await client.db('ds_db').collection('stats').updateOne(
                {playerId : player.playerId},
                { $inc: {enemy_current_health: -2, attack_action: -1} }
            )

            console.log(after_player_action)
            console.log(player.enemy_next_move)

            let enemy_next_action = player.enemy_next_move
            let enemy_almanac = await client.db('ds_db').collection('almanac').findOne({skill:{$elemMatch:{attack_name:enemy_next_action}}})

            let enemy_skill = enemy_almanac.skill.find(skill => skill.attack_name === enemy_next_action);

            console.log(enemy_skill.damage);
            console.log(enemy_skill);

            let after_enemy_action = await client.db('ds_db').collection('stats').updateOne(
                {playerId : player.playerId},
                { $inc: {health_pts: (-1 * enemy_skill.damage)} }
            )

        } else {
            res.send("Cannot attack")
        }

    } else if(req.body.action == "evade") {

        if(player.evade_action > 0) {

            res.send("evade")

            let result = await client.db('ds_db').collection('stats').updateOne(
                {playerId : player.playerId},
                { $inc: {evade_action: -1} }
            )

        } else {
            res.send("Cannot evade")
        }
    } else if(req.body.action == "defend") {

        res.send("defend")

    } else {
        res.send("Invalid Action")
    }

})