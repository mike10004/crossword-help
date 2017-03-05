'use strict';

angular.module('crosswordHelpApp')

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl',
    reloadOnSearch: false
  });
}])

.controller('HomeCtrl', ['$location', '$scope', '$window', 'Log', function($location, $scope, $window, Log) {
  Log.debug('HomeCtrl', $window.navigator.userAgent);
  $scope.showLog = $location.search()['log'] === '1';
  $scope.$watch('showLog', function(newVal, oldVal){
    if (!angular.isUndefined(newVal) && newVal !== oldVal){
      if (newVal) {
        $location.search('log', 1);
      } else {
        $location.search('log', null);
      }
    }
  });
}]);