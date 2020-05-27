const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');



const app = express();

// database config
const db = knex({
    client: 'pg',               // change to what db ur using
    connection: {
        host : '127.0.0.1',     // location of db (hosted platform)
        user : 'postgres',
        password : 'sandhi',
        database : 'facedetection'
    }
});


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

app.post('/predict', (req,res) => predict.handlePredict(req, res, db))

app.listen(PORT, () => { console.log('app is running on port ' + PORT) })

/* TODO
    predict route
    1. process the prediction data, and store in database       DONE
    2. send only box, age, gender, race     DONE
    3. create mockup data   DONE
    4. create a database according to scheme    DONE
    5. simulate storing prediction into database
*/