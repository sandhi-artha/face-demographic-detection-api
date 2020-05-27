const Clarifai = require('clarifai');
// const clarifaiApp = new Clarifai.App({ apiKey: process.env.API_KEY });

// get simulated data
const mockup = require('./mockup');

const getPrediction = (response) => {
    return response.outputs[0].data.regions.map(region => {
        const {top_row, left_col, bottom_row, right_col} = region.region_info.bounding_box;
        // calculate bounding box overlayed in image
        const box = { bTop: top_row * 100, bLeft: left_col * 100, bBot: 100 - (bottom_row * 100), bRight: 100 - (right_col * 100) };
        // get important demographic data
        const age = region.data.concepts[0].name;
        const gender = region.data.concepts[20].name;
        const race = region.data.concepts[22].name;
        return { box, age, gender, race }               // returns box:box, age:age etc as object
    })
}

const handlePredict = (req, res) => {
    // clarifaiApp.models.predict(Clarifai.DEMOGRAPHICS_MODEL, req.body.url)
    // .then(response => res.json(getPrediction(response)))
    // .catch(err => res.json("Can't fetch API data"));
    switch (req.body.url) {
        case "https://samples.clarifai.com/face-det.jpg":
            console.log("url1");
            res.json(getPrediction(mockup.url1));
            break;
        case "https://cms-tc.pbskids.org/parents/_pbsKidsForParentsHero/homeschool-socialization.jpg?mtime=20190423144706":
            console.log("url2");    // no CORS header
            res.json(getPrediction(mockup.url2));
            break;
        case "https://cdn.elearningindustry.com/wp-content/uploads/2018/12/is-socializing-in-the-workplace-important-for-team-productivity-1024x574.jpg":
            console.log("url3");
            res.json(getPrediction(mockup.url3));
            break;
        default:
            res.json(getPrediction(mockup.url1));
            break;
    }
}

module.exports = {handlePredict}