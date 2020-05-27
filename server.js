const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// env variables
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(bodyParser.json())

// resolves Access-Control-Allow-Origin error
const cors = require('cors');
app.use(cors());

// controllers
const predict = require('./Controller/predict');

// End Points
app.get('/', (req,res) => { res.json('sending from the server') })

app.post('/predict', (req,res) => predict.handlePredict(req, res))

app.listen(PORT, () => { console.log('app is running on port ' + PORT) })

/* TODO
    predict route
    1. process the prediction data, and store in database
    2. send only box, age, gender, race
*/