// for downloading images (request is deprecated but it just means it won't have any more updates)
const fs = require('fs');
const request = require('request');
const download = (url, path) => new Promise((resolve, reject) => {
    request.head(url, (err, res, body) => {
        request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', () => resolve("image downloaded"))
        .on('error', () => reject("image download failed"))     // must have error handling, or it will say unhandled stream error in pipe
    })
})

const raceOption = require('./race');

const getPrediction = (imgid, response, db) => {
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

const handlePredict = async (res, db, imgUrl, userid, response) => {
    const face = response.outputs[0].data.regions.length;
    const path = `./uploads/${new Date().toISOString().replace(/:/g,'-')}user${userid}.jpg`;
    // if the source is from url, then download it
    if (imgUrl !== "user_data") { console.log(await download(imgUrl, path)) }
    const currImage = await db('images').insert({ userid, imgurl: path.slice(2), oriurl: imgUrl, face }).returning('*')
    const currPredicts = await getPrediction(currImage[0].imgid, response, db);
    console.log("image and predictions stored")
    res.json({images: currImage, predictions: currPredicts});
}

module.exports = {handlePredict}