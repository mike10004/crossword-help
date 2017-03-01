'use strict';

angular.module('crosswordHelpApp').factory('Warehouse', ['$http', function($http) {
    class Warehouse {
        constructor() {
            this.fake = false;
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
