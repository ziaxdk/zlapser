angular.module('app', [], function ($routeProvider:ng.IRouteProvider) {
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
})
    .run(["$rootScope", "$location", "SetupModel", "$timeout", "$http", ($rootScope:INgAppRootScope, $location:ng.ILocationService, model:ISetupModel, $timeout:ng.ITimeoutService, $http:ng.IHttpService)=> {
        $rootScope.go = function (url) {
            $location.path(url);
        };

        $rootScope.job = {
            isInitial: true,
            time: {
                elapsed: 0
            }
        };

        //$rootScope.model = model;

        var socket = io.connect('http://' + window.location.hostname);

        socket.on("zlapser-status", (data)=> {
            $timeout(function () {
                angular.extend($rootScope.job, data, { isInitial: false, blink: true });
                $timeout(()=> {
                    $rootScope.job.blink = false;
                }, 250);
                //console.log("zlapser-status", $rootScope.job);
                if ($rootScope.job.isRunning)
                    $rootScope.go("running");
            });
        });

        $('body').popover({ selector: '[data-toggle="popover"]' });
        $('body').tooltip({ selector: 'a[rel="tooltip"], [data-toggle="tooltip"]' });

    }])
    .controller("start", ["$scope", "SetupModel", ($scope, model:ISetupModel)=> {
        $scope.model = model;

    }])
    .controller("setup", ["$rootScope", "$scope", "$http", "SetupModel", ($rootScope:INgAppRootScope, $scope, $http, model:ISetupModel)=> {
        $scope.model = model;
        $scope.submit = ()=> {
            $http.post("/data", $scope.model).success((res)=> {
                $scope.go("review");
            });
        };
        $scope.snap = () => {
            $http.post("/snap", $scope.model);
        };
        $scope.gpio = () => {
            $scope.showGpio = !$scope.showGpio;
        };
    }])
    .controller("review", ["$scope", "$rootScope", "$http", ($scope, $rootScope, $http)=> {
        $scope.startJob = ()=> {
            $http.post("/start");
        };
    }])
    .controller("running", ["$scope", "$http", "SetupModel", ($scope, $http, model:ISetupModel)=> {
        $scope.model = model;
        $scope.$watch(()=> {
            if (!$scope.job.isRunning) return;
            $scope.color = $scope.job.blink ? "#ccc" : "#000";
        });
        $scope.color = '#fff000';
        $scope.stopJob = ()=> {
            $http.post("/stop");
        };
    }])
    .controller("shutdownmodal", ["$scope", "$http", ($scope, $http)=> {
        $scope.fireDown = () => {
            $http.put("/shutdown").success(()=> {
                $('#shutdownmodel').modal('hide')
                $scope.go("bye");
            });
        };
    }])
    .service("SetupModel", [ function () { // Cannot use arrow function
        var optime = 125
            , fintime = 5
            , finrate = 25;
        return <ISetupModel>{
            pin: 1,
            optime: optime,
            fintime: fintime,
            finrate: finrate,
            fpsErr: function () {
                return ((this.fintime * this.finrate) / this.optime) > 2;
            },
            pin: 7
        };
    }])
    .filter("EnableDisable", ()=> {
        return (input)=> {
            return !!input ? "Enable" : "Disable";

        }
    })
    .filter("ts", function(){
      return (input)=>{
          console.log(typeof input);
        return input;
      };
    });

