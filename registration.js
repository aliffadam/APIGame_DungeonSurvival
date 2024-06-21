const express = require('express');
const registrationRouter=express.Router();
module.exports=registrationRouter;

const bcrypt = require('bcrypt')

const client = require(`./database.js`)
var jwt = require('jsonwebtoken');
//const { ObjectId } = require('mongodb');

//app.use(express.json());

//part for token verification

// client.connect()
//     .then(() => {
//         app.listen(3000, () => {
//             console.log(`Server is running on port 3000`);
//         });
//     })
//     .catch(err => console.error(err));

    function verifyToken(req, res, next) {
      const bearerHeader = req.headers['authorization'];
      if (typeof bearerHeader !== 'undefined') {
          const bearer = bearerHeader.split(' ');
          const bearerToken = bearer[1];
          req.token = bearerToken;
          jwt.verify(req.token, 'chiikawaaaaaaa', (err, authData) => {
              if(err) {
                  res.sendStatus(403);
              } else {
                  req.authData = authData;
                  next();
              }
          });
      } else {
          res.sendStatus(403);
      }
  }



registrationRouter.post('/account/login',async(req,res) => { 
    // step #1:req.body.username
      let result = await client.db("ds_db").collection("account").findOne({
        player: req.body.player
    })
    console.log(result);
    console.log(req.body);
    if(!req.body.player || !req.body.password){
      res.status(404).send('Please provide username and password')
    }
    else if(req.body.player != null && req.body.password != null){
    
      if(result){
        //step2:if user exists, check if password is correct
        if(bcrypt.compareSync(req.body.password,result.password)==true){
          var token = jwt.sign(
            { _id: result._id, player: result.player}, 
            'chiikawaaaaaaa',
          
          { expiresIn: 60*60  });
          //paaword is correct
          res.send(token);
        } else{
          //password is incorrect
          res.status(404).send('Wrong Password');
        
        }
      }else{
        //step3:if user not found
        res.send('User not found');
      
      }
  }
  })
  
  
  
  
  registrationRouter.get('/account/:id',verifyToken, async(req, res) => {
    if (req.authData._id != req.params.id) {
      res.send('User is not authorized')
    
    }
    let auth = req.headers.authorization
    console.log(auth)
  
    let authSplitted = auth.split(' ')
    console.log(authSplitted)
  
    let token = authSplitted[1]
    console.log(token)
  
    let decoded = jwt.verify(token, 'chiikawaaaaaaa')
    console.log(decoded)
  
    if (req.authData._id != req.params.id) {
      res.send('User is not authorized')
    }
    else{
    let result= await client.db("ds_db").collection("account").findOne({
      _id: new ObjectId(req.params.id)
    })
    res.send(`Player name : ${result.player}\n _id: ${result._id}`)
    
  }
  })


// Get the leaderboard

registrationRouter.get('/leaderboard', async(req, res) => {
    let LatestLB = await client.db("ds_db").collection("account")
        .find()
        .sort({ score: -1 }) // Sort by score in descending order
        .toArray();

    res.json(LatestLB);
});




//account registration



registrationRouter.post('/account/register',async(req,res)=>{
    let Exists= await client.db("ds_db").collection("account").findOne({
        player:req.body.player
    });
    if(Exists){
        res.status(404).send("Player already exists");
    }
    else{
        const hash = bcrypt.hashSync(req.body.password, 10);
        let result= await client.db("ds_db").collection("account").insertOne({
            player:req.body.player,
            password:hash
       
        });
        let result1 = await client.db('ds_db').collection('almanac').aggregate([{$sample:{size:1}}]).toArray();
      let document = result1[0]; // get the first document from the result array
      let skills = document.skill;

      // Generate a random index
      let randomIndex = Math.floor(Math.random() * skills.length);

      // Get a random skill
      let randomSkill = skills[randomIndex];


      

      let statPlayer= await client.db("ds_db").collection("stats").insertOne({
          playerID:req.body.player,
          inventory:0,
          attacl_action:10,
          current_enemy:document.enemy,
          current_score:0,
          enemy_health:document.base_health,
          enemy_next_move:randomSkill.attack_name,
          evade_acrion:5,
          heath_pts:10
    
     })
    
    }
    
    res.send("Account created successfully, please remember your player id");
    
})


//forget userid

registrationRouter.post('/account/forgetuserID', async(req, res) => {
    let result = await client.db("ds_db").collection("account").findOne({
      player: req.body.player
        
    })
    if(!req.body.player || !req.body.password){
        res.status(404).send('Please provide username and password')
      }
      else if(req.body.player != null && req.body.password != null){
      
        if(result){
          //step2:if user exists, check if password is correct
          if(bcrypt.compareSync(req.body.password,result.password)==true){
            //paaword is correct
            res.send(result._id);
          } else{
            //password is incorrect
            res.status(404).send('Wrong Password');
          
          }
        }else{
          //step3:if user not found
          res.send('User not found');
        
        }
    }
    
});


//update or change password for current account
registrationRouter.patch ("/account/changepassword" ,async (req, res) => {
    if (!req.body.newpassword) {
      return res.status(400).send('New password is required');
  }

    let findUser = await client.db('ds_db').collection('account').findOne({player:req.body.player});

    if (findUser) {

        if (bcrypt.compareSync(req.body.password, findUser.password) == true){ //compare the password with the hashed password in the database
        
        req.body.password = bcrypt.hashSync(req.body.newpassword, 10); //hash the new password
        await client.db('ds_db').collection('account').updateOne({player:req.body.player}, {$set: {password:req.body.password}}); //update the password in the database
        res.send('password changed successfully');
        }

        else { //password is incorrect
            res.status(401).send('password incorrect')
          }

    }

    else { //not found

        res.send('user not found')
  
      }
    
    });


//delete current account
registrationRouter.delete('/account/delete/:id',verifyToken, async(req, res) => {
        if(req.authData._id != req.params.id){
          res.send('User is not authorized')
        }
        else{
        let result= await client.db("ds_db").collection("account").deleteOne({
            _id: new ObjectId(req.params.id)
        })
        
        }
        
        res.send("Account Deleted Successfully");
    
    });
