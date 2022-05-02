const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors());
app.use(express.json());

//JWT 
function varifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).rsend({ message: 'Forbidden Access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

//Mongo Db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qld52.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const serviceColletion = client.db('carService').collection('service');
        const orderCollection = client.db('carService').collection('order');

        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceColletion.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceColletion.findOne(query);
            res.send(service);
        });
        //post // received from client server
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceColletion.insertOne(newService);
            res.send(result);
        });
        //Delete from database
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceColletion.deleteOne(query);
            res.send(result);
        })

        //Order collection

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        //Load CLient server
        app.get('/orders', varifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            // console.log(email);
            if (decodedEmail === email) {
                const query = { email };
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else{
                return req.status(403).send({message: 'Forbidden access'})
            }

        });
        //Access token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send({ accessToken });
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome welcome')
})

app.listen(port, () => {
    console.log('port: ', port);
})