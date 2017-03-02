'use strict';

// Declare app level module which depends on views, and components
angular.module('crosswordHelpApp', [
  'ngRoute',
  'crosswordHelpApp.home'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
