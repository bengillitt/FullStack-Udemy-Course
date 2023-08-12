import { MongoClient } from 'mongodb';
// Replace the uri string with your MongoDB deployment's connection string.
const uri = '<connection string uri>';
const client = new MongoClient(uri);
async function run() {
  try {
    const database = client.db('insertDB');
    const foods = database.collection('foods');
    // create an array of documents to insert
    const docs = [
      {
        name: 'Apple',
        score: 8,
        review: 'Great fruit',
      },
      {
        name: 'Orange',
        score: 6,
        review: 'Kinda sour',
      },
      {
        name: 'Banana',
        score: 9,
        review: 'Great stuff!',
      },
    ];
    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    const result = await foods.insertMany(docs, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);