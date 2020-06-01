const fs = require('fs');

// I'll come back to this when I could write a more readable trx chain in knex 
const handleDeleteUser = (req, res, db) => {
    const { userid } = req.body;
    db.transaction(trx => {
        console.log("deleting user row")
        trx('users').where({userid}).del()           // delete row from users table 
        .then(() => {
            return trx('images').where({userid}).select('imgid','imgurl')           // grabs every imgid of the current userid
            .then(images => {                                                       // returned an array of objects [{imgid: 1, imgurl: ''}, {imgid: 2, imgurl: ''}]
                const numImgId = images.map(id => id.imgid);                        // grab array of imgids
                let toDelete = images.map(url => url.imgurl);                       // contains path of images to be deleted
                console.log("deleting image rows");
                return trx('images').where({userid}).del()                          // delete all images rows of the current userid
                    .then(() => {
                        return trx('predictions').whereIn('imgid', numImgId).select('predid')   // grab every predid of the current imgids
                            .then(predid => {
                                const numPredId = predid.map(id => id.predid);                  // parse them to get array of predids
                                return trx('predictions').whereIn('imgid', numImgId).del()      // delete all predictions rows of current imgids
                                    .then(() => {
                                        return trx('faceblobs').whereIn('predid', numPredId).select('bloburl')   // grab all faceblob paths from current predids
                                            .then((bloburls) => {
                                                bloburls.forEach(url => toDelete.push(url.bloburl))
                                                toDelete.forEach(path => {
                                                    fs.unlink(path, (err) => {      // deleting image file
                                                        if (err) {
                                                          console.log("error when deleting file",err);
                                                          return
                                                        }
                                                        console.log("deleted: ", path);
                                                      })
                                                })
                                                console.log("deleting bloburl rows")
                                                return trx('faceblobs').whereIn('predid', numPredId).del()      // delete all faceblob rows of current preids
                                                    .then(() => res.json('user deleted'))
                                            })
                                    })
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