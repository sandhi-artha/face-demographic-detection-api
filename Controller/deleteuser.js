
const handleDeleteUser = (req, res, db) => {
    const { email, userid } = req.body;
    console.log(email, userid);
    db.transaction(trx => {
        console.log("going to users table")
        trx('users').where({email})//.del()           // delete row from users table 
        .then(() => {
            console.log("going to images table")
            return trx('images').where({userid}).select('imgid')    
                .then(imgid => {                                        // returned an array of object [{imgid: 1}, {imgid: 2}, {imgid: 3}]
                    const numImgId = imgid.map(id => id.imgid);         // parse the array to have numbers only [1,2,3]
                    return trx('images').where({userid})//.del()
                        .then(() => {
                            console.log("going to predictions, imgid" + imgid)
                            return trx('predictions').whereIn('imgid', numImgId).select('predid')
                                .then(predid => {
                                    const numPredId = predid.map(id => id.predid);
                                    console.log(predid, imgid);
                                    res.json([numPredId, numImgId]);
                                })
                        })
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {res.status(400).json('Error occured when trying to delete user')})

}

module.exports = {handleDeleteUser}