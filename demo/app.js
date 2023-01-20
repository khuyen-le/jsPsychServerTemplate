// --- LOADING MODULES
var express = require('express'),
    body_parser = require('body-parser');
    path = require('path');
    fs = require('fs');

// --- INSTANTIATE THE APP
var app = express();

// --- STATIC MIDDLEWARE 
app.use(express.static(__dirname + '/public'));
app.use('/jspsych/dist', express.static(path.join(__dirname, "../jspsych/dist")));

// --- BODY PARSING MIDDLEWARE
app.use(body_parser.json()); // to support JSON-encoded bodies

// --- VIEW LOCATION, SET UP SERVING STATIC HTML
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// --- ROUTING
app.get('/', function(request, response) {
    response.render('index.html');
});

app.get('/demo', function(request, response) {
    const N_PPT = 30; // define number of participants to run
    fs.readdir("data", (err, files) => {
        if (files.length < N_PPT) { // serve the experiment if number of files have not reached the quota
            response.render('go_no_go.html');
        } else {
            app.get('/full', function(request, response){ // show an error page if number of files have reached the quota
                response.render('full.html');
            })
            response.end();
        }
      });
});

app.get('/finish', function(request, response) {
    response.render('finish.html');
})

/* Save experiment response into 'data' folder */
app.post('/experiment-data', function(request, response){  
    //console.log(request.body);
    var filename = "data/" + "demo-" + (request.body)["subject_id"] + ".json";
    var data = JSON.stringify((request.body)["data"]);
    fs.writeFile(filename, data, (err) => {
        if (err) {
            throw err;
        }
        console.log("successfully saved data");
    });
    response.end();
})

// --- START THE SERVER 
var server = app.listen(process.env.PORT || 3001, function(){
    console.log("Listening on port %d", server.address().port);
});
