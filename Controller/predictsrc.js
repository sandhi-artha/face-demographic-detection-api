// process the prediction data, where data eventually gets sent
const predict = require('./predict');

// get simulated data
const mockup = require('./mockup');
const mockupData = (url) => {
    if(url==="https://samples.clarifai.com/face-det.jpg"){
        console.log("url1")
        return mockup.url1
    } else if(url==="https://cms-tc.pbskids.org/parents/_pbsKidsForParentsHero/homeschool-socialization.jpg?mtime=20190423144706"){
        console.log("url2")    
        return mockup.url2
    } else { 
        console.log("url3")
        return mockup.url3 }
}

// ClarifAI API
const Clarifai = require('clarifai');
const clarifaiApp = new Clarifai.App({ apiKey: process.env.API_KEY });

const handlePredictURL = async (req, res, db) => {
    const {imgUrl, userid} = req.body;
    try {
        // const response = mockupData(imgUrl);
        const response = await clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, imgUrl);
        console.log(response);
        predict.handlePredict(req, res, db, imgUrl, userid, response)
    } catch (error) {
        console.log("invalid url or API failure");
        res.status(400).json("Failed retrieving image URL");
    }
}

const handlePredictClipboard = async (req, res, db) => {
    const {userid} = req.body;
    const imgUrl = "user_data";
    const b64 = req.file.buffer.toString('base64');
    try {
        const response = await clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, {base64: b64});
        predict.handlePredict(req, res, db, imgUrl, userid, response)
    } catch (error) {
        console.log("invalid url or API failure");
        res.status(400).json("Failed retrieving API response")
    }
}

module.exports = {handlePredictURL, handlePredictClipboard}