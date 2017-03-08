'use strict';

window.onunhandledrejection = function (event) {
  let reason = event.reason;
  console.warn('Unhandled promise rejection:', (reason && (reason.stack || reason)));
};

// Declare app level module which depends on views, and components
angular.module('crosswordHelpApp', [
  'ngRoute',
  'ngWebworker'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
