var express = require("express");
var app = express();
app.use(express.logger());

var port = process.env.PORT || 5000;

var Trello = require("node-trello");
var public_key = process.env.TRELLO_KEY;
var trello_token = process.env.TRELLO_TOKEN; // TODO: replace with stored auth from admin user
var t = new Trello(public_key, trello_token);
var _ = require("underscore");

app.get('/dsdc', function(req, res){
  // get JSON for DSDC events and send back
    t.get("/1/boards/4ffd9be44795a71d1101b2bc", //?cards=open&card_fields=name,due,labels,idList,pos&fields=name,desc&lists=open", 
        { cards: "open", card_fields: ["name", "due", "labels", "idList", "pos"], fields: ["name", "desc"], lists: "open"},
        function(err, data) {
        if (err) throw err;
        
        private_id = _.findWhere(data.lists, {name: "Private"}).id;

        data.cards = _.filter(data.cards, function(card) { return card.idList != private_id; });
        res.send(data);
        
    });
});

// TODO: dsdc.html that generates a nice table

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


