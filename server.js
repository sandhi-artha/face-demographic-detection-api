const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');

const app = express();

// database config
const connLocal = { host : '127.0.0.1', user : 'postgres', password : 'sandhi', database : 'facedetection' }
const connHeroku = { connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false} }
const db = knex({ client: 'pg', connection: connHeroku });

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
