/// <reference path="angular.d.ts" />

interface INgAppRootScope extends ng.IScope {
    isRunning: bool;
    model: any;
    go(url: string): void;
    job: {};
    toggleSandbox(): void;


}

interface ISetupModel {
    pin: number;
    optime: number;
    fintime: number;
    finrate: number;
    pin: number;
    sandbox: bool;

}