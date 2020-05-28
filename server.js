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
    6. error handling still not good, you have catch everytime store in database but it sends a response which will trigger an error bcz other ops also sends response (can only send once)
    7. send back updated images and predictions

    create register route   DONE
    create signin route     DONE
    create delete user route    DONE, needs testing (can do later)

    for database
    1. 'face' column in 'images' table is redundant, it equals to predictions.length, it's also hard to store synchronously, delete it later
    2. mind that its possible that a prediction doesn't contain a face, so the predictions should not be NOT NULL
    3. store faceblobs to database (after constructing front end), requires multer
    4. very last: add option to receive blob data instead of url (or can be done with generated URL blob??)


    for download function
    1. at size limiter of only 1 MB
*/