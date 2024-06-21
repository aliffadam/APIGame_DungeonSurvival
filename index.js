const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())

let client = require(`./database`)

const almanacRoute = require(`./almanac`)
const inventoryRoute = require(`./inventory`)
const nextActionRoute = require(`./next_action`)
const registrationRoute = require(`./registration`)

app.use(almanacRoute)
app.use(inventoryRoute)
app.use(nextActionRoute)
app.use(registrationRoute)

app.get('/', (req, res) => {
   res.send('Welcome to dungeon dive game!')
})

///////////////////////////////////////////////////////////////////////////////////////////////////////

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);