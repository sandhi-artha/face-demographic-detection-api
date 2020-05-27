const express = require('express');
require('dotenv').config();
const Clarifai = require('clarifai');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

const clarifaiApp = new Clarifai.App({ apiKey: process.env.API_KEY });

// middlewares
app.use(bodyParser.json())
app.use(cors());        // resolves Access-Control-Allow-Origin error

app.get('/', (req,res) => {
    res.json('sending from the server');
})

app.post('/predict', (req,res) => {
    clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, req.body.url)
    .then(data => res.json(data))
    .catch(err => res.json("Can't fetch API data"));
})

app.listen(5000, () => {
    console.log('app is running on port 5000');
})