var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var jsonfile = require('jsonfile');
var util = require('util');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/scripts', express.static(__dirname + '/node_modules/'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


/*
State PIDs for the RCP average JSON API:
sCarolinaPID = 4167;
nevadaPID = 5337;
texasPID = 4158;
georgiaPID = 5623; -- empty response as of 2016-02-23
massachusettsPID = 3891;
virginiaPID = 3922;
minnesotaPID = 3585;
tennesseePID = 5768;
arkansasPID = 5233;
oklahomaPID = 5739;
vermontPID = 5796;
*/


// This array needs to be updated with more states as the polls will be coming in.
statesArray = [
    ['SC', 'NV', 'TX', 'MA', 'VA', 'MN', 'TN', 'AR', 'OK', 'VT', 'LA'],
    [4167,5337,4158,3891,3922,3585,5768,5233,5739,5796, 5695]
];


/**
 *  The interval is meant to be for updating the polling data every hour.
 */
var interval = setInterval(function() {
    for (var i = 0; i < statesArray[0].length; i++) {
        (function (i) {
            var preview_suffix = '';
            var myUrl = 'http://www.realclearpolitics.com/epolls/json/' + statesArray[1][i] + '_historical' + preview_suffix + '.js?' + '';
            var jsonObject;
            var file = './public/javascripts/' + statesArray[0][i] + '.json';


            request({
                url: myUrl,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body); // Print the json response
                    jsonObject = JSON.parse(body.substr(12, body.length - 14));
                    var finalObject = {
                        "frontrunnerName": jsonObject.poll.rcp_avg[0].candidate[0].name,
                        "frontrunnerPoints": jsonObject.poll.rcp_avg[0].candidate[0].value,
                        "underdogName": jsonObject.poll.rcp_avg[0].candidate[1].name,
                        "underdogPoints": jsonObject.poll.rcp_avg[0].candidate[1].value
                    };
                    jsonfile.writeFile(file, finalObject, function (err) {
                        console.error(err);
                    })
                }
            });
        })(i);
    }
}, 3600000);

module.exports = app;
