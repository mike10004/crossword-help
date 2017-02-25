'use strict';

// Declare app level module which depends on views, and components
angular.module('crosswordHelpApp', [
  'ngRoute',
  'crosswordHelpApp.view1'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
