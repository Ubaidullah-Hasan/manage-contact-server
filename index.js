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



        //  *************** userCollection ***************
        app.post("/users", async (req, res) => {
            const body = req.body;
            // console.log(body);

            // chcek user exist
            const query = { email: body.email };
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: "user already exist!" });
            }

            const options = {
                weekday: 'short',   // Example: "Fri"
                year: 'numeric',    // Example: "2023"
                month: 'long',     // Example: "August"
                day: 'numeric',     // Example: "25"
                hour: '2-digit',    // Example: "08"
                minute: '2-digit',  // Example: "27"
                second: '2-digit',  // Example: "45"
                timeZoneName: 'short'  // Example: "GMT+6"
            };

            const formattedDate = new Date().toLocaleString(undefined, options);

            const userInfo = {
                userName: body.userName,
                password: body.password,
                email: body.email,
                memberAt: formattedDate,
                userRole: body.role,
            };

            const result = await userCollection.insertOne(userInfo);
            res.send(result);
        });

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const options = {
                projection: { password: 0, memberAt: 0, },
            }
            const result = await userCollection.findOne(query, options);
            res.send(result);
        })

        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const body = req.body;
            // console.log(body);
            const query = { email: email };
            const person = await userCollection.findOne(query);

            const updateDoc = {
                $set: {
                    profileImg: body.image
                },
            };

            const options = { upsert: true };
            const result = await userCollection.updateOne(person, updateDoc, options);
            res.send(result);
        })





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


        // delete multiple contacts
        app.post("/deleteMultipleContacts", async (req, res) => {
            const { contactIds } = req.body;
            // console.log(contactIds);

            const objectIdsToDelete = contactIds.map(id => new ObjectId(id));
            try {
                const query = { _id: { $in: objectIdsToDelete } };
                const result = await contactCollection.deleteMany(query);
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Error deleting contacts' });
            }
        })











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