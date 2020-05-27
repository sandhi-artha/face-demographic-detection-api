const express = require('express');

const app = express();
app.get('/', (req,res) => {
    res.json('sending from the server');
})

app.listen(5000, () => {
    console.log('app is running on port 5000');
})