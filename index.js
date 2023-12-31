const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.j32tjfb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const dbConnect = async () => {
  try {
    // await client.connect();
    console.log('Database Connected!');
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const userInfoCollection = client.db('bloodAid').collection('userInfo');
const donationRequestCollection = client
  .db('bloodAid')
  .collection('donationRequest');
const blogCollection = client.db('bloodAid').collection('blogData');

app.get('/', (req, res) => {
  res.send('BloodAid is Here!');
});

// User related API
//! post for user from register
app.post('/users', async (req, res) => {
  const addUser = req.body;
  const result = await userInfoCollection.insertOne(addUser);
  res.send(result);
});

// for all users data
app.get('/users', async (req, res) => {
  const cursor = userInfoCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// for updating profile data w/ mongoDB with id
app.get('/dashboard/update-profile/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userInfoCollection.findOne(query);
  res.send(result);
});

// for updating user profile
app.put('/dashboard/update-profile/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateProfile = req.body;
  const job = {
    $set: {
      name: updateProfile.name,
      photo: updateProfile.photo,
      email: updateProfile.email,
      blood: updateProfile.blood,
      district: updateProfile.district,
      upazila: updateProfile.upazila,
      status: updateProfile.status,
      role: updateProfile.role,
    },
  };
  const result = await userInfoCollection.updateOne(filter, job, options);
  res.send(result);
});

//! Donation Related API

// create donation request page data
app.post('/dashboard/create-donation-request', async (req, res) => {
  const addDonationReq = req.body;
  const result = await donationRequestCollection.insertOne(addDonationReq);
  res.send(result);
});

// for all donation requests
app.get('/dashboard/create-donation-request', async (req, res) => {
  const email = req.query.requester_email;
  const query = { requester_email: email };
  const result = await donationRequestCollection.find(query).toArray();
  res.send(result);
});

// for getting update donation requests
app.get('/dashboard/my-donation-requests-update/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await donationRequestCollection.findOne(query);
  res.send(result);
});

// for updating  donation request
app.put('/dashboard/my-donation-requests-update/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDonationReq = req.body;
  const job = {
    $set: {
      requester_name: updateDonationReq.requester_name,
      requester_email: updateDonationReq.requester_email,
      recipient_name: updateDonationReq.recipient_name,
      blood: updateDonationReq.blood,

      recipient_district: updateDonationReq.recipient_district,
      recipient_upazila: updateDonationReq.recipient_upazila,
      hospital_name: updateDonationReq.hospital_name,
      full_address: updateDonationReq.full_address,
      donation_date: updateDonationReq.donation_date,
      donation_time: updateDonationReq.donation_time,
      request_message: updateDonationReq.request_message,
      status: updateDonationReq.status,
      // role: updateDonationReq.role,
    },
  };
  const result = await donationRequestCollection.updateOne(
    filter,
    job,
    options
  );
  res.send(result);
});

// delete from donation req donationRequestCollection
app.delete('/dashboard/create-donation-request/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await donationRequestCollection.deleteOne(query);
  res.send(result);
});

// using patch , making pending to inprogress donation requests
app.patch('/dashboard/status/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'inprogress',
    },
  };
  const result = await donationRequestCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// using patch , making inprogress to done donation requests
app.patch('/dashboard/status-done/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'done',
    },
  };
  const result = await donationRequestCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// using patch , making inprogress to canceled donation requests
app.patch('/dashboard/status-canceled/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'canceled',
    },
  };
  const result = await donationRequestCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

//! for useAdmin hook

app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;

  // verifyToken
  // if (email !== req.decoded.email) {
  //   return res.status(403).send({ message: 'forbidden access' })
  // }

  const query = { email: email };
  const user = await userInfoCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === 'admin';
  }
  res.send({ admin });
});

//! for Volunteer hook

app.get('/users/volunteer/:email', async (req, res) => {
  const email = req.params.email;

  // verifyToken
  // if (email !== req.decoded.email) {
  //   return res.status(403).send({ message: 'forbidden access' })
  // }

  const query = { email: email };
  const user = await userInfoCollection.findOne(query);
  let volunteer = false;
  if (user) {
    volunteer = user?.role === 'volunteer';
  }
  res.send({ volunteer });
});

// fetching all donation reqs data for admin
app.get('/allDonationReqs', async (req, res) => {
  const cursor = donationRequestCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// unblocking patch
app.patch('/dashboard/admin/unblock/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'active',
    },
  };
  const result = await userInfoCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// blocking patch
app.patch('/dashboard/admin/block/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'blocked',
    },
  };
  const result = await userInfoCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// make volunteer patch
app.patch('/dashboard/admin/make-volunteer/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: 'volunteer',
    },
  };
  const result = await userInfoCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// make admin patch
app.patch('/dashboard/admin/make-admin/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: 'admin',
    },
  };
  const result = await userInfoCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

//! Blog Section

// post blog
app.post('/add-blog', async (req, res) => {
  const addBlog = req.body;
  const result = await blogCollection.insertOne(addBlog);
  res.send(result);
});

// get all blog data
app.get('/add-blog', async (req, res) => {
  const cursor = blogCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// Unpublish the Blog
app.patch('/dashboard/admin/unpublish/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'draft',
    },
  };
  const result = await blogCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// Publish the Blog
app.patch('/dashboard/admin/publish/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      status: 'published',
    },
  };
  const result = await blogCollection.updateOne(filter, updatedDoc);
  res.send(result);
});

// delete blog (admin, duh)
app.delete('/dashboard/delete-blog/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await blogCollection.deleteOne(query);
  res.send(result);
});

app.listen(port, () => {
  console.log(`BloodAid is running on port:${port}`);
});
