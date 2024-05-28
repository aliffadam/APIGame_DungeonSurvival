const bcrypt = require('bcrypt')
const express = require('express');
const Next_Action_Router = express.Router();
module.exports = Next_Action_Router;

let client = require(`./database.js`)

//TODO change to post as we are creating an action
Next_Action_Router.get('/next_action', async (req, res) => {    // player give the next action they want to do

    let player = await client.db('ds_db').collection('stats').findOne(  //find a document by playerId referring to playerId
        {
            playerId: req.body.playerId
        }
    )

    console.log(player)

    if(!player) {           //if there is no player in the database(stats); reject
        res.send('Could not find your player')
        return
    }

    if(req.body.action == "attack") {       //if player choose to attack

        console.log(player)

        if(player.attack_action > 0) {      //attack action available?
            res.send("attack")

            let after_player_action = await client.db('ds_db').collection('stats').updateOne(   //damage to enemy and consume attack action
                {playerId : player.playerId},
                { $inc: {enemy_current_health: -2, attack_action: -1} }
            )

            //TODO
            //check if enemy health <= 0
            //if yes, then update it with a new randomised enemy
            //don't continue code (use return)

            console.log(after_player_action)
            console.log(player.enemy_next_move)

            let enemy_next_action = player.enemy_next_move  //get enemy_next_move from stats(player's stats)
            let enemy_almanac = await client.db('ds_db').collection('almanac').findOne({skill:{$elemMatch:{attack_name:enemy_next_action}}})    //finding info from almanac

            let enemy_skill = enemy_almanac.skill.find(skill => skill.attack_name === enemy_next_action);   //get the json corresponding to its attack_name

            console.log(enemy_skill.damage);
            console.log(enemy_skill);

            let after_enemy_action = await client.db('ds_db').collection('stats').updateOne(    //enemy damage the player based on its next_attack
                {playerId : player.playerId},
                { $inc: {health_pts: (-1 * enemy_skill.damage)} }
            )

            //TODO
            //randomise enemy next action

        } else {
            res.send("Cannot attack")
        }

    } else if(req.body.action == "evade") {

        if(player.evade_action > 0) {

            res.send("evade")

            let result = await client.db('ds_db').collection('stats').updateOne(    //evade: does not take damage
                {playerId : player.playerId},                                       //so only reduce evade points
                { $inc: {evade_action: -1} }
            )

            //TODO
            //randomise next enemy_action

        } else {
            res.send("Cannot evade")
        }
    } else if(req.body.action == "defend") {        //TODO

        res.send("defend")

    } else {
        res.send("Invalid Action")
    }

})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Next_Action_Router.post('/register',async(req,res)=>{
//     let Exists= await client.db("ds_db").collection("account").findOne({
//         player:req.body.player
//     });
//     if(Exists){
//         res.status(404).send("Player already exists");
//     }
//     else{
//         const hash = bcrypt.hashSync(req.body.password, 10);
//         let result= await client.db("ds_db").collection("account").insertOne({
//             player:req.body.player,
//             password:hash
//         });
//         let document = result1[0]; // get the first document from the result array
//         let skills = document.skill;

//         // Generate a random index
//         let randomIndex = Math.floor(Math.random() * skills.length);

//         // Get a random skill
//         let randomSkill = skills[randomIndex];


        

//         let statPlayer= await client.db("ds_db").collection("stat").insertOne({
//             playerID:req.body.player,
//             inventory:0,
//             attack_action:10,
//             current_enemy:document.enemy,
//             current_score:0,
//             enemy_health:document.base_health,
//             enemy_next_move:randomSkill.attack_name,
//             evade_acrion:5,
//             heath_pts:10
      
//        })
//     res.send({message:"Account created successfully, please remember your player id"});
// }})