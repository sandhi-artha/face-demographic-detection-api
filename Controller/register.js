const bcrypt = require('bcryptjs');

const handleRegister = (req, res, db) => {
    const { name, email, password } = req.body;
    let hash = bcrypt.hashSync(password, 10);       // encrypt the password and store as hash
    db('users').insert({ name, email, joined: new Date(), hash })
    .then(data => {
        delete data[0].hash;                                // don't want the hash sent to the front end
        console.log(data[0].name+" registered!");
        res.json({profile: data[0], images: [], predictions: []});
    })
    .catch(err => res.status(400).json('Error: Name or email has already been used!'))
}

module.exports = {handleRegister}