require('dotenv').config();
const fs = require('fs');
const express = require('express');
const GithubController = require('./controllers/github-controller');
const PORT = process.env.PORT || 3000;
const app = express();

/************ Middleware ************/
app.use(express.static('front-end/dist'));
app.use(express.json());

/************ Route Controllers ************/
app.use('/github', GithubController);

/************ Requests ************/
app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile(`index.html`, (err, data) => {
        if (err) {
            return console.log(err);
        }
        res.end(data);
    });
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});