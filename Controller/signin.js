const bcrypt = require('bcryptjs');


const handleSignin = (req, res, db) => {
    const { email, password } = req.body;
    db.transaction(trx => {
        trx('users').where({email})
        .then(user => {     // grab user data
            if(bcrypt.compareSync(password, user[0].hash)){                 // check if password matches hash
                return trx('images').where({userid: user[0].userid})
                    .then(images => {       // grab image data, if user have no images, it will return empty array
                        delete user[0].hash;                                // don't want the hash sent to the front end
                        const imgid = images.map( image => image.imgid )
                        return trx('predictions').whereIn('imgid', imgid)
                            .then(predictions => {
                                console.log("user signed in!");
                                res.json({ profile: user[0], images, predictions });
                            })
                    })
            } else { res.status(400).json('Error: incorrect email/passowrd') }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => {res.status(400).json('Error: incorrect email/passowrd')})
}


module.exports = {handleSignin}