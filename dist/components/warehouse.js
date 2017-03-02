'use strict';

angular.module('crosswordHelpApp').factory('Warehouse', ['$http', function($http) {
    class Warehouse {
        constructor() {
        }

        fetch() {
            return new Promise(function(resolve, reject){
                $http.get('data/assets.json')
                  .then(response => resolve(response.data))
                  .catch(response => reject(response));
            }); 
        }
    }
    return new Warehouse();
}]);
