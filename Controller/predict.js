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
    savePredict(db, data);
    return data
}

const savePredict = (db, data) => {
    db('predictions').insert(data)
    .then(console.log("prediction stored"))
    .catch(err => res.status(400).json("error storing predictions to database"))
}

const saveImages = (imgUrl, userId, db) => {
    const path = `./uploads/${new Date().toISOString().replace(/:/g,'-')}user${userId}.jpg`;
    download(imgUrl, path, () => { console.log('downloaded image') })
    db('images').insert({ userid: userId, imgurl: path, oriurl: imgUrl })
    .then(() => console.log("image stored"))
    .catch(err => res.status(400).json("error storing image to database"))
}

const handlePredict = (req, res, db) => {
    // clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, req.body.url)
    // .then(response => res.json(getPrediction(response)))
    // .catch(err => res.json("Can't fetch API data"));
    const imgUrl = req.body.url;
    const userId = 1;
    saveImages(imgUrl, userId, db);
    switch (req.body.url) {
        case "https://samples.clarifai.com/face-det.jpg":
            console.log("url1");
            res.json(getPrediction(mockup.url1, db));
            break;
        case "https://cms-tc.pbskids.org/parents/_pbsKidsForParentsHero/homeschool-socialization.jpg?mtime=20190423144706":
            console.log("url2");    // no CORS header
            res.json(getPrediction(mockup.url2, db));
            break;
        case "https://cdn.elearningindustry.com/wp-content/uploads/2018/12/is-socializing-in-the-workplace-important-for-team-productivity-1024x574.jpg":
            console.log("url3");
            res.json(getPrediction(mockup.url3, db));
            break;
        default:
            res.json(getPrediction(mockup.url2, db));
            break;
    }
}

module.exports = {handlePredict}