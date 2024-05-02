const express=require('express');
const InventoryRouter=express.Router();
module.exports=InventoryRouter;

let client = require(`./database.js`)

// GET the players
InventoryRouter.get('/api/players/:playerId/inventory', async (req, res) => {
  const{playerId}=req.params;
  if (!ObjectId.isValid(playerId) ) {
    return res.status(400).send('Invalid ID format');
  }

  const player = await client.db('players').collection('player').findOne({ _id: new ObjectId(playerId) });
  if (!player) {
    return res.status(404).send('Player not found');
  }
  res.send(player.inventory);
});

//POST an item to a player's inventory
InventoryRouter.post('/api/players/:playerId/inventory', async (req, res) => {
  const { playerId } = req.params;
  if (!ObjectId.isValid(playerId)) {
    return res.status(400).send('Invalid ID format');
  }
  const player = await client.db('players').collection('player').findOne({ _id: new ObjectId(playerId) });
  if (!player) {
    return res.status(404).send('Player not found');
  }
  const item = new Inventory(req.body);
  player.inventory.push(item);
  await player.save();
  res.send(item);
});


// DELETE an item from a player's inventory
InventoryRouter.delete('/api/players/:playerId/inventory/:itemId', async (req, res) => {
  const { playerId, itemId } = req.params;
  if (!ObjectId.isValid(playerId) || !ObjectId.isValid(itemId)) {
    return res.status(400).send('Invalid ID format');
  }
  const player = await client.db('players').collection('player').findOne({ _id: new ObjectId(playerId) });
  if (!player) {
    return res.status(404).send('Player not found');
  }
  const item = await Inventory.findOne({ _id: ObjectId(itemId) });
  if (!item) {
    return res.status(404).send('Item not found');
  }
  player.inventory.remove(item);
  await player.save();
  res.send('Item removed from inventory');
});
