/**
 * third party libraries
 */
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const cors = require('cors');
const compression = require('compression');
const path = require("path");

/**
 * server configuration
 */
const config = require('../config/');
const dbService = require('./services/db.service');
const auth = require('./policies/auth.policy');

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

/**
 * express application
 */
const app = express();
const server = http.Server(app);
const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');
const DB = dbService(environment, config.migrate).start();

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// secure express app
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

app.use(compression());

// parsing the request bodys
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.all('/', (req, res, next) => catalog(req, res, next));

//secure your private routes with jwt authentication middleware
app.all('/api/private/*', (req, res, next) => auth(req, res, next));

// secure your private routes with OAuth authentication middleware
//app.all('/api/private/*', (req, res, next) => oauth(req, res, next));

// fill routes for express application
app.use('/api/public', mappedOpenRoutes);
app.use('/api/private', mappedAuthRoutes);

// Check routes exist or not
app.use('*', function (req, res) {
  res.send("Occurs error on your request");
});

app.get("/file/:fileName", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  //const fileName = req.body.fileName;
  const fileName = req.params.fileName;
  // res.send(path.join(__dirname, "../uploads/"+fileName)); // Send only path
  res.sendFile(path.join(__dirname, "../uploads/"+fileName)); // download
}); // Create # Pradip


server.listen(config.port, () => {
  if (environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    process.exit(1);
  }
  return DB;
});
