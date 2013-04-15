angular.module('app', [], function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: "html.tmpl"
    });
    $routeProvider.when('/about', {
        templateUrl: "readme.md"
    });
    $routeProvider.when('/start', {
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
    function ($rootScope, $location, model) {
        $rootScope.go = function (url) {
            $location.path(url);
        };
        $rootScope.job = {
        };
        $rootScope.model = model;
        $rootScope.toggleSandbox = function () {
            model.sandbox = !model.sandbox;
        };
        var socket = io.connect('http://localhost');
        socket.on("zlapser-status", function (data) {
            console.log(data);
            angular.extend($rootScope.job, data);
            if($rootScope.job.isRunning) {
                $rootScope.go("running");
            }
            if(!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        });
        $('body').popover({
            selector: '[data-toggle="popover"]'
        });
        $('body').tooltip({
            selector: 'a[rel="tooltip"], [data-toggle="tooltip"]'
        });
    }]).controller("setup", [
    "$rootScope", 
    "$scope", 
    "$http", 
    function ($rootScope, $scope, $http) {
        $scope.submit = function () {
            $http.post("/data", $rootScope.model).success(function (res) {
                $scope.go("review");
            });
        };
        $scope.snap = function () {
            $http.post("/snap", $rootScope.model);
        };
    }]).controller("review", [
    "$scope", 
    "$rootScope", 
    "$http", 
    function ($scope, $rootScope, $http) {
        $scope.startJob = function () {
            $http.post("/start");
        };
    }]).controller("running", [
    "$scope", 
    "$http", 
    function ($scope, $http) {
        $scope.stopJob = function () {
            $http.post("/stop");
        };
    }]).controller("shutdownmodal", [
    "$scope", 
    "$http", 
    function ($scope, $http) {
        $scope.fireDown = function () {
            $http.put("/shutdown");
        };
    }]).service("SetupModel", [
    function () {
        return {
            pin: 1,
            optime: 10,
            fintime: 10,
            finrate: 10,
            pin: 4,
            sandbox: true
        };
    }]);
//@ sourceMappingURL=ngapp.js.map
