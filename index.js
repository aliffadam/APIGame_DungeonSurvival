const bcrypt = require('bcrypt')
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


app.get('/leaderboard', async(req, res) => {
    let LatestLB = await client.db("benr24231").collection("datacollection")
        .find()
        .sort({ score: -1 }) // Sort by score in descending order
        .toArray();

    res.json(LatestLB);
});
app.post('/register',async(req,res)=>{
    let Exists= await client.db("benr24231").collection("datacollection").findOne({
        player:req.body.player
    });
    if(Exists){
        res.status(404).send("Player already exists");
    }
    else{
        const hash = bcrypt.hashSync(req.body.password, 10);
        let result= await client.db("benr24231").collection("datacollection").insertOne({
            player:req.body.player,
            password:hash
        });
    }
    res.send({message:"Account created successfully, please reme,ber your player id"});
})
app.post('/forgetuserID', async(req, res) => {
    let result = await client.db("benr24231").collection("datacollection").findOne({
        player: req.body.player,
        password: req.body.password
    })
    if(!req.body.username || !req.body.password){
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

app.listen(port, () => {
    console.log(`Leaderboard app listening on port ${port}`);
});



