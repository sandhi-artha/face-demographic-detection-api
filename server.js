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

// multer config, has 2 engines, using diskStorage or memoryStorage
const multer = require('multer');
const storage = multer.diskStorage({        // multer executes these functions everytime a file is received
    destination: function(req, file, cb){
        cb(null, './uploads');              // null can be replaced with a potential error, relative path
    },
    filename: function(req, file, cb){
        // in windows, u can't use ':' as filename, so we replace all ':' in the time format with dash (g is for global replace)
        // adding .jpg in the end bcz images saved as blob don't have original names with them
        cb(null, new Date().toISOString().replace(/:/g,'-') + file.originalname + '.jpg');    
    }
})
const upload = multer({storage: storage});
const storageBuffer = multer.memoryStorage();           // when using this, multer will store the files in memory as buffer objects
const getBuffer = multer({storage: storageBuffer});

// env variables
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// grants Access-Control-Allow-Origin header (put it before express static so it applies to static files also)
const cors = require('cors');
app.use(cors());

// middlewares
app.use(bodyParser.json())
app.use('/uploads', express.static('uploads'))      // used to make a static folder (uploads) publicly available

// controllers
const register = require('./Controller/register');
const signin = require('./Controller/signin');
const deleteuser = require('./Controller/deleteuser');
const blobs = require('./Controller/blobs');
const predictsrc = require('./Controller/predictsrc');

// End Points
app.get('/', (req,res) => { res.json('sending from the server') })

app.post('/register', (req, res) => register.handleRegister(req, res, db))

app.post('/signin', (req, res) => signin.handleSignin(req, res, db))

app.delete('/deleteuser', (req, res) => deleteuser.handleDeleteUser(req, res, db))

app.post('/blobs', upload.array('image'), (req,res) => blobs.handleBlobs(req, res, db))

app.post('/predict', (req,res) => predictsrc.handlePredictURL(req, res, db))

app.post('/predictclipboard', getBuffer.single('imgBlob'), (req,res) => predictsrc.handlePredictClipboard(req, res, db))

app.listen(PORT, () => { console.log('app is running on port ' + PORT) })

/* TODO
    predict route
    1. process the prediction data, and store in database       DONE
    2. send only box, age, gender, race     DONE
    3. create mockup data   DONE
    4. create a database according to scheme    DONE
    5. simulate storing prediction into database    DONE
    6. Fix error handling
        you have catch everytime store in database but it sends a response which will trigger an error bcz other ops also sends response (can only send once)
    7. send back updated images and predictions     DONE
    8. change image path to be uploads... instead of ./uploads...

    create register route   DONE
    create signin route     DONE
    create delete user route    DONE, needs testing (can do later)
    create receive blobs route, store to faceblobs table, requires multer     DONE

    for database
    1. 'face' column in 'images' table is redundant, it equals to predictions.length, it's also hard to store synchronously, delete it later    NO, faces can be useful
    2. mind that its possible that a prediction doesn't contain a face, so the predictions should not be NOT NULL
    3. store faceblobs to database (after constructing front end), requires multer  DONE
    4. very last: add option to receive blob data (from file upload, or pasting ss) instead of url (or can be done with generated URL blob??)   DONE

    CURRENT
    you want to use the downloaded image to be the one painted in the FE, but it needs to finish downloading before you can use it
    otherwise it will return 404 Not Found      DONE, reworked the download function to return promise

    1. at size limiter of only 1 MB

    Left to do:
    1. fix error handling and console.log for progress
*/