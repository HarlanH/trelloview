var express = require("express");
var app = express();
app.use(express.logger());

var port = process.env.PORT || 5000;

var Trello = require("node-trello");
var public_key = process.env.TRELLO_KEY;
var trello_token = process.env.TRELLO_TOKEN; // TODO: replace with stored auth from admin user
var t = new Trello(public_key, trello_token);

var _ = require("underscore");
var fs = require('fs');
var mustache = require('mustache'); 

var get_dsdc = function(callback) {
    t.get("/1/boards/4ffd9be44795a71d1101b2bc", 
        { cards: "open", card_fields: ["name", "due", "labels", "idList", "pos"], fields: ["name", "desc"], lists: "open"},
        function(err, data) {
        if (err) throw err;
        
        private_id = _.findWhere(data.lists, {name: "Private"}).id;

        data.cards = _.filter(data.cards, function(card) { return card.idList != private_id; });
//        console.log(data);
//        console.log(callback);
        callback(data);
    });
};

app.get('/dsdc', function(req, res){
  // get JSON for DSDC events and send back
  console.log("Got request for DSDC");
  get_dsdc(res.send.bind(res));
});

// generates a nice table
var make_table = function(callback, data) {
    
    // convert the object to html here
    var soon = _.filter(data.cards, function(card) { return !_.isNull(card.due); });
    var notsoon = _.filter(data.cards, function(card) { return _.isNull(card.due); });
    var rData = {records: soon.concat(notsoon) }; 
    var page = fs.readFileSync("dsdc.html", "utf8"); // bring in the HTML file
    var html = mustache.to_html(page, rData);
    callback(html);
};

app.get('/dsdc.html', function(req,res) {
    get_dsdc(_.partial(make_table, res.send.bind(res)));
});

app.get('/sentrana', function(req, res){
    // get JSON for Sentrana cards, build a table, and send back.
    t.get("/1/boards/517edde193eedc2703001b30",
        { cards: "visible", card_fields:["name","desc","due","labels","idList","pos"], fields:["name","desc"], lists:"open"}, 
        function(err, data) {
        if (err) throw err;
        
        res.send(data);
    });
})

app.get('/boards', function(req, res){
    t.get("1/members/me/boards", function(err, data) {
       if (err) throw err;
       
       res.send(data);
    });
})

// TODO: auth endpoint that gets and stores (mongo?) an auth key
// TODO: cache results

app.listen(port, function() {
  console.log("Listening on " + port);
});


