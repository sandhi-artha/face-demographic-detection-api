// for downloading images (request is deprecated but it just means it won't have any more updates)
const fs = require('fs');
const request = require('request');
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
        .on('error', err => {console.log("Error downloading image! ", err.message)})     // must have error handling, or it will say unhandled stream error in pipe
    })
}

// ClarifAI API
// const Clarifai = require('clarifai');
// const clarifaiApp = new Clarifai.App({ apiKey: process.env.API_KEY });

// get simulated data
// https://samples.clarifai.com/face-det.jpg
const mockup = require('./mockup');
const raceOption = require('./race');

const getPrediction = (response, db) => {
    const data = response.outputs[0].data.regions.map(region => {
        const {top_row, left_col, bottom_row, right_col} = region.region_info.bounding_box;
        // calculate bounding box overlayed in image
        const btop = top_row * 100;
        const bleft =  left_col * 100;
        const bbot = 100 - (bottom_row * 100);
        const bright = 100 - (right_col * 100);
        // get important demographic data
        const age = Number(region.data.concepts[0].name);
        const gender = region.data.concepts[20].name === 'masculine';
        const race = raceOption.race.indexOf(region.data.concepts[22].name);            // returns race index
        const imgid = 1;
        return { imgid, age, gender, race, btop, bleft, bbot, bright }                  // returns box:box, age:age etc as object
    })
    const currPredicts = savePredict(db, data);
    return currPredicts
}

const savePredict = async (db, data) => {
    const currPredicts = await db('predictions').insert(data).returning('*')
    return currPredicts
    // .catch(err => res.status(400).json("error storing predictions to database"))     // res is not defined here
}

const saveImages = async (imgUrl, userid, db) => {
    const path = `./uploads/${new Date().toISOString().replace(/:/g,'-')}user${userid}.jpg`;
    // download(imgUrl, path, () => { console.log('downloaded image') })
    const currImage = await db('images').insert({ userid, imgurl: path, oriurl: imgUrl }).returning('*')
    return currImage[0]
    // .catch(err => res.status(400).json("error storing image to database"))   // res is not defined here
}

const mockupData = (url) => {
    if(url==="https://samples.clarifai.com/face-det.jpg"){
        return mockup.url1
    } else if(url==="https://cms-tc.pbskids.org/parents/_pbsKidsForParentsHero/homeschool-socialization.jpg?mtime=20190423144706"){
        return mockup.url2
    } else { return mockup.url3 }
}

const handlePredict = async (req, res, db) => {
    // clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, req.body.url)
    // .then(response => res.json(getPrediction(response)))
    // .catch(err => res.json("Can't fetch API data"));
    const imgUrl = req.body.url;
    const userid = 2;
    const response = mockupData(req.body.url);
    const currImage = saveImages(imgUrl, userid, db);       // returns a promise
    const currPredicts = getPrediction(response, db);       // also a promise
    const currData = await Promise.all([currImage, currPredicts])   // resolves both promises
    res.json(currData);
}

module.exports = {handlePredict}