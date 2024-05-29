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

    if (!player) {           //if there is no player in the database(stats); reject
        res.send('Could not find your player')
        return
    }

    if (req.body.action == "attack") {       //if player choose to attack

        //console.log(player)

        if (player.attack_action <= 0) {  //attack action available?
            res.send("Not enough attack action!")
            return
        }

        let after_player_action = await client.db('ds_db').collection('stats').updateOne(   //damage to enemy and consume attack action
            { playerId: player.playerId },
            { $inc: { enemy_current_health: -2, attack_action: -1 } }
        )

        //check if enemy health <= 0 //refer to 2 as it must not be less than zero
        if (player.enemy_current_health <= 2) {

            let enemy_list = await client.db('ds_db').collection('almanac').find().toArray()

            //making a random index to choose in almanac
            let randomEnemyIndex = Math.floor(Math.random() * enemy_list.length)

            //this is the enemy chosen at random
            let chosenEnemy = enemy_list[randomEnemyIndex]

            //making a random index to choose enemy skill
            let randomEnemySkillIndex = Math.floor(Math.random() * chosenEnemy.skill.length)

            //this is the skill of the enemy chosen at random
            let chosenEnemySkill = chosenEnemy.skill[randomEnemySkillIndex]

            //update it with a new randomised enemy
            let new_enemy = await client.db('ds_db').collection('stats').updateOne(
                { playerId: player.playerId },
                {
                    $set:
                    {
                        current_enemy: chosenEnemy.enemy,
                        enemy_current_health: chosenEnemy.base_health,
                        enemy_next_move: chosenEnemySkill
                    }
                }
            )

            res.send(`The ${player.current_enemy} died\nA ${chosenEnemy.enemy} appeared!`)

            //don't continue code (use return)
            return
        }

        let enemy_action_damage = player.enemy_next_move.damage  //get enemy_next_move damage from stats(player's stats)

        console.log(player.enemy_next_move);
        //console.log(enemy_action_damage);

        let after_enemy_action = await client.db('ds_db').collection('stats').updateOne(    //enemy damage the player based on its next_attack
            { playerId: player.playerId },
            { $inc: { health_pts: (-1 * enemy_action_damage) } }
        )

        //randomise enemy next action
        let enemy_current = await client.db('ds_db').collection('almanac').findOne(
            { enemy: player.current_enemy }
        )

        //making a random index to choose enemy skill
        let randomEnemySkillIndex = Math.floor(Math.random() * enemy_current.skill.length)

        enemy_new_skill = enemy_current.skill[randomEnemySkillIndex]

        let enemy_change_skill = await client.db('ds_db').collection('stats').updateOne(
            { playerId: player.playerId },
            { $set: { enemy_next_move: enemy_new_skill } }
        )

        res.send(`You did 2 damage and the ${player.current_enemy} did ${player.enemy_next_move.damage} damage!`)

    } else if (req.body.action == "evade") {

        if (player.evade_action <= 0) {
            res.send("Not enough evade action!")
            return
        }

        let result = await client.db('ds_db').collection('stats').updateOne(    //evade: does not take damage
            { playerId: player.playerId },                                       //so only reduce evade points
            { $inc: { evade_action: -1 } }
        )

        //randomise enemy next action
        let enemy_current = await client.db('ds_db').collection('almanac').findOne(
            { enemy: player.current_enemy }
        )

        //making a random index to choose enemy skill
        let randomEnemySkillIndex = Math.floor(Math.random() * enemy_current.skill.length)

        enemy_new_skill = enemy_current.skill[randomEnemySkillIndex]

        let enemy_change_skill = await client.db('ds_db').collection('stats').updateOne(
            { playerId: player.playerId },
            { $set: { enemy_next_move: enemy_new_skill } }
        )

        res.send(`The ${player.current_enemy} tried to hit with ${player.enemy_next_move.damage} damage but you dodged it!`)

    } else if (req.body.action == "defend") {

        let half_damage = Math.ceil(player.enemy_next_move.damage / 2); // Calculate half damage, rounding up if necessary

        let result = await client.db('ds_db').collection('stats').updateOne(
            { playerId: player.playerId },
            { $inc: { health_pts: -half_damage } }
        )

        //Find the reference of the enemy to choose the set of skills available
        let currentEnemy = await client.db('ds_db').collection('almanac').findOne(
            {
                enemy: player.current_enemy
            }
        )

        //making a random index to choose enemy skill
        let randomEnemySkillIndex = Math.floor(Math.random() * currentEnemy.skill.length)

        //this is the skill of the enemy chosen at random
        let chosenEnemySkill = currentEnemy.skill[randomEnemySkillIndex]

        //update it with a new randomised enemy
        let new_enemy = await client.db('ds_db').collection('stats').updateOne(
            { playerId: player.playerId },
            {
                $set:
                {
                    enemy_next_move: chosenEnemySkill
                }
            }
        )

        res.send(`Defended! You only took ${half_damage} damage!`)

    } else {
        res.send("Invalid Action")
    }
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Next_Action_Router.post('/register', async (req, res) => {
    let Exists = await client.db("ds_db").collection("account").findOne({
        player: req.body.player
    });
    if (Exists) {
        res.status(404).send("Player already exists");
    }
    else {
        const hash = bcrypt.hashSync(req.body.password, 10);
        let result = await client.db("ds_db").collection("account").insertOne({
            player: req.body.player,
            password: hash
        });

        let result1 = await client.db('ds_db').collection('almanac').aggregate([{ $sample: { size: 1 } }]).toArray();

        let document = result1[0]; // get the first document from the result array
        let skills = document.skill;

        // Generate a random index
        let randomIndex = Math.floor(Math.random() * skills.length);

        // Get a random skill
        let randomSkill = skills[randomIndex];




        let statPlayer = await client.db("ds_db").collection("stats").insertOne({
            playerID: req.body.player,
            heath_pts: 10,
            attack_action: 10,
            evade_action: 5,
            inventory: 0,
            current_enemy: document.enemy,
            enemy_health: document.base_health,
            enemy_next_move: randomSkill,
            current_score: 0
        })
        res.send({ message: "Account created successfully, please remember your player id" });
    }
})