const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app =express();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors());
app.use(express.json());

//Mongo Db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qld52.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const serviceColletion = client.db('carService').collection('service');
        app.get('/service', async(req, res) => {
            const query = {};
            const cursor = serviceColletion.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceColletion.findOne(query);
            res.send(service);
        });
        //post // received from client server
        app.post('/service', async(req, res) => {
            const newService = req.body;
            const result = await serviceColletion.insertOne(newService);
            res.send(result);
        });
        //Delete from database
        app.delete('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceColletion.deleteOne(query);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome welcome')
})

app.listen(port, () => {
    console.log('port: ', port);
})