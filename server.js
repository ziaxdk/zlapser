var express = require('express'), http = require('http'), proc = require('child_process'), moment = require('moment'), pagedown = require('pagedown'), fs = require('fs'), gp = require("gpio");
var gpport;
var model = (function () {
    "use strict";
    var settings = {
    };
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
    var setupJob = function () {
        job.currentFrame = 0;
        job.percent = 0;
        job.numOfTotalFrames = settings.fintime * settings.finrate;
        job.interval = (settings.optime * 1000 / job.numOfTotalFrames);
        job.isRunning = true;
        job.time.start = moment();
        job.time.elapsed = "-";
        job.time.end = job.time.start.clone().add('seconds', settings.optime);
    };
    var start = function (req, res) {
        var setupInterval = function () {
            jobId = setInterval(function () {
                job.currentFrame++;
                io.sockets.emit('zlapser-status', job);
                if(job.numOfTotalFrames <= job.currentFrame) {
                    stop(null, null);
                    return;
                }
                job.percent = (job.currentFrame / job.numOfTotalFrames) * 100;
                job.time.elapsed = moment.duration(moment().diff(job.time.start)).humanize(false);
                if(job.isPi) {
                    gpport.set();
                }
                setTimeout(function () {
                    if(job.isPi) {
                        gpport.reset();
                    }
                }, 100);
            }, job.interval);
        };
        if(jobId === null) {
            setupJob();
            if(job.isPi) {
                io.sockets.emit('zlapser-status', job);
                gpport = gp.export(settings.pin, {
                    ready: setupInterval
                });
            } else {
                console.log("emu gpio setup");
                setupInterval();
            }
        }
        res.send(")]}',\n" + "ok");
    };
    var stop = function (req, res) {
        if(jobId !== null) {
            clearInterval(jobId);
            if(job.isPi) {
                gpport.reset();
                gpport.unexport();
            }
            jobId = null;
            job.isRunning = false;
            job.percent = 100;
            io.sockets.emit('zlapser-status', job);
        }
        if(res) {
            res.send(")]}',\n" + "ok");
        }
    };
    var shutdown = function (req, res) {
        if(job.isPi) {
            proc.exec("shutdown -h now", function () {
            }, function () {
            });
        }
        res.send(")]}',\n" + "ok");
    };
    var snap = function (req, res) {
        if(job.isPi && gpport == null) {
            gpport = gp.export(req.body.pin, {
                ready: function () {
                    console.log("set");
                    gpport.set(1, function () {
                        setTimeout(function () {
                            console.log("reset");
                            gpport.reset();
                            gpport.unexport();
                            gpport = null;
                        }, 1000);
                    });
                }
            });
        }
        res.send(")]}',\n" + "ok");
    };
    return {
        job: job,
        data: function (req, res) {
            settings = req.body;
            res.send(")]}',\n" + "ok");
        },
        start: start,
        stop: stop,
        shutdown: shutdown,
        snap: snap,
        pause: function (req, res) {
        }
    };
})();
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
app.get("/readme.md", function (req, res) {
    fs.readFile(__dirname + '/readme.md', 'utf-8', function (err, data) {
        if(err) {
            res.send("<p>Error getting readme.md</p>");
        }
        var converter = new pagedown.Converter();
        res.send(")]}',\n" + converter.makeHtml(data));
    });
});
io.sockets.on('connection', function (socket) {
    socket.emit('zlapser-status', model.job);
});
fs.exists("/sys/class/gpio", function (exists) {
    model.job.isPi = exists;
});
app.configure('development', function () {
    io.set('log level', 1);
    console.log("configure development");
});
app.configure('production', function () {
    io.set("transports", [
        "xhr-polling"
    ]);
    io.set("polling duration", 10);
    io.set('log level', 1);
    io.enable('browser client minification');
    console.log("configure production");
});
app.use(express.static(__dirname + "/src"));
var port = process.env.PORT || 8080;
theServer.listen(port, function () {
    console.log("Listening on " + port);
});
//@ sourceMappingURL=server.js.map
