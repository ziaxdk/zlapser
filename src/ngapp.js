angular.module('app', [], function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: "html.tmpl"
    });
    $routeProvider.when('/about', {
        templateUrl: "readme.md"
    });
    $routeProvider.when('/bye', {
        templateUrl: "bye.tmpl"
    });
    $routeProvider.when('/start', {
        controller: "start",
        templateUrl: "start.tmpl"
    });
    $routeProvider.when('/review', {
        templateUrl: "review.tmpl",
        controller: "review"
    });
    $routeProvider.when('/running', {
        templateUrl: "running.tmpl",
        controller: "running"
    });
    $routeProvider.otherwise({
        redirectTo: "/"
    });
}).run([
    "$rootScope", 
    "$location", 
    "SetupModel", 
    "$timeout", 
    "$http", 
    function ($rootScope, $location, model, $timeout, $http) {
        $rootScope.go = function (url) {
            $location.path(url);
        };
        $rootScope.iframes = '';
        $rootScope.job = {
        };
        $rootScope.$watch('job.isPi', function (n, o) {
            if(!n) {
                $rootScope.iframes = "youtube1.tmpl";
            }
        });
        var socket = io.connect('http://' + window.location.hostname);
        socket.on("zlapser-status", function (data) {
            $timeout(function () {
                angular.extend($rootScope.job, data, {
                    blink: true
                });
                $timeout(function () {
                    $rootScope.job.blink = false;
                }, 250);
                if($rootScope.job.isRunning) {
                    $rootScope.go("running");
                }
            });
        });
        $('body').popover({
            selector: '[data-toggle="popover"]'
        });
        $('body').tooltip({
            selector: 'a[rel="tooltip"], [data-toggle="tooltip"]'
        });
    }]).controller("start", [
    "$scope", 
    "SetupModel", 
    function ($scope, model) {
        $scope.model = model;
    }]).controller("setup", [
    "$rootScope", 
    "$scope", 
    "$http", 
    "SetupModel", 
    function ($rootScope, $scope, $http, model) {
        $scope.model = model;
        $scope.submit = function () {
            $http.post("/data", $scope.model).success(function (res) {
                $scope.go("review");
            });
        };
        $scope.snap = function () {
            $http.post("/snap", $scope.model);
        };
        $scope.gpio = function () {
            $scope.showGpio = !$scope.showGpio;
        };
    }]).controller("review", [
    "$scope", 
    "$rootScope", 
    "$http", 
    function ($scope, $rootScope, $http) {
        $scope.startJob = function () {
            $http.post("/start").success(function () {
                $scope.go("running");
            });
        };
    }]).controller("running", [
    "$scope", 
    "$http", 
    "SetupModel", 
    function ($scope, $http, model) {
        $scope.model = model;
        $scope.$watch(function () {
            if(!$scope.job.isRunning) {
                return;
            }
            $scope.color = $scope.job.blink ? "#ccc" : "#000";
        });
        $scope.color = '#fff000';
        $scope.stopJob = function () {
            $http.post("/stop");
        };
    }]).controller("shutdownmodal", [
    "$scope", 
    "$http", 
    function ($scope, $http) {
        $scope.fireDown = function () {
            $http.put("/shutdown").success(function () {
                $('#shutdownmodel').modal('hide');
                $scope.go("bye");
            });
        };
    }]).service("SetupModel", [
    function () {
        var optime = 125, fintime = 5, finrate = 25;
        return {
            pin: 1,
            optime: optime,
            fintime: fintime,
            finrate: finrate,
            fpsErr: function () {
                return ((this.fintime * this.finrate) / this.optime) > 2;
            },
            pin: 7
        };
    }]).filter("EnableDisable", function () {
    return function (input) {
        return !!input ? "Enable" : "Disable";
    }
}).filter("ts", function () {
    return function (input) {
        console.log(typeof input);
        return input;
    }
});
//@ sourceMappingURL=ngapp.js.map
