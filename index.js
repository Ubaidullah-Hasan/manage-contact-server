const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var cors = require('cors');
const app = express();


// middlewire
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 4000;








//  MONGODB connection start ******************************
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.clipjzr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const contactCollection = client.db("contactManage").collection("contacts");
        const userCollection = client.db("contactManage").collection("users");
        const shareCollection = client.db("contactManage").collection("shares");



        //  *************** userCollection ***************







        //  *************** contactCollection ***************
        app.get("/contacts", async (req, res) => {
            const result = await contactCollection.find().toArray();
            res.send(result);
        })

        
        app.get("/contacts/search", async (req, res) => {
            try {
                const { query } = req.query;
                // console.log(query);

                if (query) {
                    const searchResult = await contactCollection.find({
                        name: { $regex: new RegExp(query, 'i') } // 'i' makes it case-insensitive
                    }).toArray();
                    res.send(searchResult);
                } else {
                    const searchResult = await contactCollection.find().toArray();
                    res.send(searchResult);
                }

            } catch (error) {
                console.error('Error searching contacts:', error);
                res.status(500).send({ error: 'Internal server error' });
            }
        });

        


        






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

//  MONGODB connection end ******************************




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})