const mongoose = require('mongoose');
const { Batch } = require('./hp education banswara/server/models/Academic');
require('dotenv').config({ path: './hp education banswara/server/.env' });

async function checkBatches() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const batches = await Batch.find();
    console.log('Total Batches in DB:', batches.length);
    console.log('Batches:', JSON.stringify(batches, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkBatches();
