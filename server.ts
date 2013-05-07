/// <reference path="../_ts/node.d.ts" />

var express = require('express')
    , http = require('http')
    , proc = require('child_process')
    , moment = require('moment')
    , pagedown = require('pagedown')
    , fs = require('fs'),
    //, rpio = require("rpio")
    gpio = require("pi-gpio")
    ;

var model = (() => {
    "use strict";
    var settings = {},
        isPaused = false,
        jobId = null,
        isPi = false,
        Gpio,

        counter = 0,
        intervalCallback,

        job = {
            isPi: false,
            isRunning: false,
            percent: 0,
            numOfTotalFrames: 0,
            currentFrame: 0,
            time: {
            }
        },
        start = (req, res) => {
            console.log("Starting...")
            if (jobId !== null) {
                res.send(")]}',\n" + "err");
                return;
            }
            isPaused = false;
            counter = 0;
            job.isRunning = true;
            job.percent = 0;
            job.numOfTotalFrames = 0;
            job.currentFrame = 0;
            job.time.start = moment();
            job.time.elapsed = "-";
            job.time.end = job.time.start.clone().add('seconds', settings.optime);
            if (isPi) {
                rpio.setOutput(settings.pin);
            }
            jobId = setInterval(function () {
                if (counter === settings.fintime * settings.finrate) {
                    stop(null, null);
                    return;
                }
                if (isPaused) return;
                counter++;
                if (typeof intervalCallback != "function") {
                    stop(null, null);
                    return;
                }
                job.time.elapsed = moment.duration(moment().diff(job.time.start)).humanize(false);
                intervalCallback(counter, ((counter / (settings.fintime * settings.finrate)) * 100).toFixed(2));
            }, (settings.optime / (settings.fintime * settings.finrate)) * 1000);
            io.sockets.emit('zlapser-status', job);
            console.log("Started...")
            res.send(")]}',\n" + "ok");
        },
        stop = (req, res) => {
            console.log("Stopping...")
            if (jobId === null) {
                res.send(")]}',\n" + "err");
                return;
            }
            clearInterval(jobId);
            jobId = null;
            job.isRunning = false;
            io.sockets.emit('zlapser-status', job);
            console.log("Stopped...")
            if (res)
                res.send(")]}',\n" + "ok");


        },
        pause = (req, res) => {
            console.log("Pausing...");
            if (jobId !== null) {
                isPaused = !isPaused;
                console.log("Paused...");

            }
            res.send(")]}',\n" + "ok");

        },
        setupZlapser = (req, res) => {
            settings = req.body;
            res.send(")]}',\n" + "ok");
        },
        snap = (req, res) => {
//            var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
//                led = new Gpio(4, 'out');            //rpio.setOutput(req.body.pin);
            shutter(req.body.pin);
            console.log("done", req.body.pin);
            res.send(")]}',\n" + "ok");

        },
        shutter = (pin) => {
            /*var pin = new Gpio(pin, 'out');
            pin.write(1, (err)=>{});
            setTimeout(() => {
                pin.write(0, (err)=>{});
                pin.unexport();

            }, 100);*/
            res.send(")]}',\n" + "ok");
        },
        shutdown = (req, res) => {
            if (isPi) {
                proc.exec("shutdown -h now");
            }
            res.send(")]}',\n" + "ok");
        },
        scriptPi = (counter, percent) => {
            console.log("Pi", "c:", counter, "p:", percent);
            job.percent = percent;
            job.numOfTotalFrames = settings.fintime * settings.finrate;
            job.currentFrame = counter;
            io.sockets.emit('zlapser-status', job);
            shutter(settings.pin);
        },
        scriptNonPi = (counter, percent) => {
            console.log("NonPi", "c:", counter, "p:", percent);
            job.percent = percent;
            job.numOfTotalFrames = settings.fintime * settings.finrate;
            job.currentFrame = counter;
            io.sockets.emit('zlapser-status', job);
        },
        setScript = (exists) => {
            job.isPi = isPi = exists;
            intervalCallback = exists ? scriptPi : scriptNonPi;
//            Gpio = require('onoff').Gpio;
        };


    return {
        isPi: isPi,
        job: job,
        start: start,
        stop: stop,
        pause: pause,
        setupZlapser: setupZlapser,
        snap: snap,
        shutdown: shutdown,
        setScript: setScript
    }

})();


var app = express();
var theServer = http.createServer(app);
var io = require('socket.io').listen(theServer);


app.use(express.bodyParser());
app.post("/data", model.setupZlapser);
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
        res.send(")]}',\n" + converter.makeHtml(data));
    });
});

io.sockets.on('connection', (socket) => {
    socket.emit('zlapser-status', model.job);
});
fs.exists("/sys/class/gpio", (exists)=> {
    model.setScript(exists);
});

app.configure('development', ()=> {
    io.set('log level', 1); // reduce logging
    console.log("configure development");
});

app.configure('production', ()=> {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set('log level', 1); // reduce logging
    io.enable('browser client minification');
    console.log("configure production");
});


app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 8080;
theServer.listen(port, function () {
    console.log("Listening on " + port);
});
//console.log(process.env)

