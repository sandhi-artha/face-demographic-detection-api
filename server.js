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
const register = require('./Controller/register');
const signin = require('./Controller/signin');
const deleteuser = require('./Controller/deleteuser');

// End Points
app.get('/', (req,res) => { res.json('sending from the server') })

app.post('/register', (req, res) => register.handleRegister(req, res, db))

app.post('/signin', (req, res) => signin.handleSignin(req, res, db))

app.delete('/deleteuser', (req, res) => deleteuser.handleDeleteUser(req, res, db))

app.post('/predict', (req,res) => predict.handlePredict(req, res, db))

app.listen(PORT, () => { console.log('app is running on port ' + PORT) })

/* TODO
    predict route
    1. process the prediction data, and store in database       DONE
    2. send only box, age, gender, race     DONE
    3. create mockup data   DONE
    4. create a database according to scheme    DONE
    5. simulate storing prediction into database    DONE

    create register route   DONE
    create signin route     DONE
    create delete user route    DONE, needs testing (can do later)

    for database
    1. face col is redundant, it equals to images.length
    2. mind that its possible that a prediction doesn't contain a face, so the predictions should not be NOT NULL
*/