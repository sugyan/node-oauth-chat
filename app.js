var express = require('express');
var app     = express.createServer();
var io      = require('socket.io');

var conf = require('node-config');
conf.initConfig(function(err) {
    if (err) throw err;

    var oauth = new (require('oauth').OAuth)(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        conf.twitter.consumer,
        conf.twitter.consumer_secret,
        '1.0',
        'http://' + conf.host + ':' + conf.port + '/signin/twitter',
        'HMAC-SHA1'
    );

    app.configure(function() {
        app.use(express.staticProvider({ root: __dirname + '/static' }));
        app.use(express.cookieDecoder());
        app.use(express.session());
    });

    app.set('view engine', 'ejs');
    app.helpers({
        title: undefined,
        js: []
    })
    app.dynamicHelpers({
        session: function(req, res){
            return req.session;
        }
    });

    app.get('/', function(req, res) {
        res.render('index', { locals: { js: ['index.js'] } });
    });
    app.get('/signin/twitter', function(req, res) {
        var oauth_token    = req.query.oauth_token;
        var oauth_verifier = req.query.oauth_verifier;
        if (oauth_token && oauth_verifier && req.session.oauth) {
            oauth.getOAuthAccessToken(
                oauth_token, null, oauth_verifier,
                function(error, oauth_access_token, oauth_access_token_secret, results) {
                    if (error) {
                        res.send(error, 500);
                    } else {
                        req.session.user = results.screen_name;
                        res.redirect('/');
                    }
                }
            );
        } else {
            oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
                if (error) {
                    res.send(error, 500);
                } else {
                    req.session.oauth = {
                        oauth_token: oauth_token,
                        oauth_token_secret: oauth_token_secret,
                        request_token_results: results
                    };
                    console.log(req.session.oauth);
                    res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
                }
            });
        }
    });
    app.get('/signout', function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

    app.listen(conf.port);
    console.log('Server running at http://' + conf.host + ':' + conf.port + '/');
});


var socket = io.listen(app);
socket.on('connection', function(client) {
    console.log('connection');
});
