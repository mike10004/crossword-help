'use strict';

angular.module('crosswordHelpApp.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl',
    reloadOnSearch: false
  });
}])

.controller('HomeCtrl', [function() {
  // nothing to do yet
}]);