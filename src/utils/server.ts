const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const route = require('../app/route');

function createServer() {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(passport.initialize());
    app.use(express.json());

    route(app);

    return app;
}
module.exports = createServer;
export {}