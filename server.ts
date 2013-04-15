/// <reference path="../_ts/node.d.ts" />

var express = require('express')
    , http = require('http')
    , proc = require('child_process')
    , moment = require('moment')
    , showdown = require('showdown')
    , md = showdown.converter()
    , fs = require('fs')

    ;


var model = (() => {
    "use strict";
    var settings = {};

    var jobId = null;
    var job = {
        isRunning: false,
        percent: 0,
        numOfTotalFrames: 0,
        currentFrame: 0,
        time: {
            start: null,
            elapsed: null
        }
    };

    var setupJob = () => {
        job.currentFrame = 0;
        job.percent = 0;
        job.numOfTotalFrames = settings.fintime * settings.finrate;
        job.interval = (settings.optime * 1000 / job.numOfTotalFrames);
        job.isRunning = true;
        job.time.start = moment();
        job.time.end = job.time.start.clone().add('seconds', 60);

        console.log(job);

    };

    var start = (req, res) => {
        if (jobId !== null) return;
        setupJob();
        jobId = setInterval(function () {
            io.sockets.emit('zlapser-status', job);
            if (job.numOfTotalFrames <= job.currentFrame) stop(null, null);
            job.currentFrame++;
            job.percent = Math.floor((job.currentFrame / job.numOfTotalFrames) * 100);
            job.time.elapsed = moment().diff(job.time.start);
            console.log("Set high");

            setTimeout(()=>{
                console.log("Set low");
            }, 5);
        }, job.interval);
        res.send("ok");
    };

    var stop = (req, res) => {
        if (jobId === null) return;
        clearInterval(jobId);
        jobId = null;
        job.isRunning = false;
        io.sockets.emit('zlapser-status', job);
        //io.sockets.emit('zlapser-running', false);
    };

    var shutdown = (req, res) => {
        proc.exec("shutdown -h now");
        res.send("ok");
    };

    var snap = (req, res) =>{
        var o = req.body;
        if (o.sandbox){
            res.send(true)
            return;
        }
        res.send("ok" + req.body.pin);
    };

    return {
        job: job,
        data: (req, res) => {
            settings = req.body;
            res.send("ok");
        },
        start: start,
        stop: stop,
        shutdown: shutdown,
        snap: snap,
        pause: (req, res) => {

        }
    }

})
    ();


var app = express();
var theServer = http.createServer(app);
var io = require('socket.io').listen(theServer);

app.use(express.bodyParser());
app.post("/data", model.data);
app.post("/start", model.start);
app.post("/stop", model.stop);
app.post("/pause", model.pause);
app.post("/resume", model.pause);
app.post("/snap", model.snap);
app.put("/shutdown", model.shutdown);
app.get("/info.md", (req, res)=>{

    fs.readFile(__dirname + '\\readme.md', function (err, data) {
        if (err) throw err;
        console.log(showdown.makeHtml(data));
        res.send(data);

        //res.send(showdown.makeHtml(data));
    });
});

io.enable('browser client minification');
io.sockets.on('connection', (socket) => {
    socket.emit('zlapser-status', model.job);
});


app.use(express.static(__dirname + "/src"));
theServer.listen(8080);
console.log(md, showdown,"Up and running on http://localhost:8080... :-)");
