/// <reference path="../_ts/node.d.ts" />

var express = require('express')
    , http = require('http')
    , proc = require('child_process')
    , moment = require('moment')
    , pagedown = require('pagedown')
    , fs = require('fs')
    , gpio = require('rpi-gpio')
    ;

var model = (() => {
    "use strict";
    var settings = {};

    var jobId = null;
    var job = {
        isPi: false,
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
    };

    var start = (req, res) => {
        if (jobId === null && job.isPi) {
            setupJob();

            gpio.setup(settings.pin, gpio.DIR_OUT, ()=> {
                jobId = setInterval(function () {
                    io.sockets.emit('zlapser-status', job);
                    if (job.numOfTotalFrames <= job.currentFrame) {
                        stop(null, null);
                        return;

                    }
                    job.currentFrame++;
                    job.percent = Math.floor((job.currentFrame / job.numOfTotalFrames) * 100);
                    job.time.elapsed = moment().diff(job.time.start);

                    gpio.write(settings.pin, 1);
                    setTimeout(()=> {
                        gpio.write(settings.pin, 0);
                    }, 100);
                }, job.interval);
            });
        }
        res.send("ok");
    };

    var stop = (req, res) => {
        if (jobId !== null && job.isPi) {
            clearInterval(jobId);
            jobId = null;
            job.isRunning = false;
            io.sockets.emit('zlapser-status', job);
            gpio.destroy();
            //io.sockets.emit('zlapser-running', false);
        }
        res.send("ok");
    };

    var shutdown = (req, res) => {
        if (job.isPi) {
            proc.exec("shutdown -h now", ()=> {
            }, ()=> {
            });
        }
        res.send("ok");
    };

    var snap = (req, res) => {
        if (job.isPi) {
            gpio.setup(req.body.pin, gpio.DIR_OUT, ()=> {
                gpio.write(req.body.pin, 1, ()=> {
                    setTimeout(()=> {
                        gpio.write(req.body.pin, 0, ()=> {
                            gpio.destroy();
                        });
                    }, 100);
                });
            });
        }
        res.send("ok");
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
app.get("/readme.md", (req, res)=> {

    fs.readFile(__dirname + '/readme.md', 'utf-8', function (err, data) {
        if (err) {
            res.send("<p>Error getting readme.md</p>");
        }
        var converter = new pagedown.Converter();
        res.send(converter.makeHtml(data));
    });
});

io.set('log level', 1); // reduce logging
//io.enable('browser client minification');
io.sockets.on('connection', (socket) => {
    socket.emit('zlapser-status', model.job);
});
fs.exists("/sys/class/gpio", (exists)=> {
    model.job.isPi = exists;
    //model.job.isPi = true;
});


app.use(express.static(__dirname + "/src"));
theServer.listen(8080);
console.log("Up and running on http://localhost:8080... :-)");
