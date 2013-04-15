angular.module('app', [], function ($routeProvider:ng.IRouteProvider) {
    $routeProvider.when('/', {
        templateUrl: "html.tmpl"
    });
    $routeProvider.when('/about', {
        templateUrl: "about2.tmpl"
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
})
    .run(["$rootScope", "$location", "$templateCache", "$http", "SetupModel", ($rootScope:INgAppRootScope, $location:ng.ILocationService, $templateCache:ng.ITemplateCacheService, $http:ng.IHttpService, model:ISetupModel)=> {
        $rootScope.go = function (url) {
            $location.path(url);
        };


        $rootScope.job = {
        };

        $rootScope.model = model;

        $rootScope.toggleSandbox = () => {
            model.sandbox = !model.sandbox;
        };
        var socket = io.connect('http://localhost');

        socket.on("zlapser-status", (data)=> {
            console.log(data);
            angular.extend($rootScope.job, data);
            if ($rootScope.job.isRunning)
                $rootScope.go("running");
            if (!$rootScope.$$phase)
                $rootScope.$apply();
        });

        $http.get("/info.md").success((res) => {
            $templateCache.put("about2.tmpl", res);
        });

        $('body').popover({ selector: '[data-toggle="popover"]' });
        $('body').tooltip({ selector: 'a[rel="tooltip"], [data-toggle="tooltip"]' });

    }])
    .controller("setup", ["$rootScope", "$scope", "$http", ($rootScope:INgAppRootScope, $scope, $http)=> {
        $scope.submit = ()=> {
            $http.post("/data", $rootScope.model).success((res)=> {
                $scope.go("review");
            });
        };
        $scope.snap = () => {
            $http.post("/snap", $rootScope.model);
        };
    }])
    .controller("review", ["$scope", "$rootScope", "$http", ($scope, $rootScope, $http)=> {
        $scope.startJob = ()=> {
            $http.post("/start");
        };
    }])
    .controller("running", ["$scope", "$http", ($scope, $http)=> {
        $scope.stopJob = ()=> {
            $http.post("/stop");
        };
    }])
    .controller("shutdownmodal", ["$scope", "$http", ($scope, $http)=> {
        $scope.fireDown = () => {
            $http.put("/shutdown");
        };
    }])
    .service("SetupModel", [()=> {
        return <ISetupModel>{
            pin: 1,
            optime: 10,
            fintime: 10,
            finrate: 10,
            pin: 4,
            sandbox: true
        };
    }])
;

