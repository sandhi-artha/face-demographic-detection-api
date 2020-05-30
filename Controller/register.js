const bcrypt = require('bcryptjs');

const handleRegister = (req, res, db) => {
    const { name, email, password } = req.body;
    let hash = bcrypt.hashSync(password, 10);       // encrypt the password and store as hash
    db('users').returning(['name','email','joined']).insert({
        name: name,
        email: email,
        joined: new Date(),
        hash: hash
    }).then(data => {
        console.log("user registered!");
        res.json(data[0]) })
    .catch(err => res.status(400).json('Error: Name or email has already been used!'))
}

module.exports = {handleRegister}