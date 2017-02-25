angular.module('crosswordHelpApp').factory('Arbiter', 
['Log', '$q', function(Log, $q){
    

    class Arbiter {
        constructor() { 
            Log.debug('Arbiter');
        }

        lookup(template) {
            const query = {
                template: template
            };
            const p = new Promise(function(resolve, reject){
                let w = new Worker('logic/lookup.js');
                w.onmessage = function(event) {
                    Log.debug("lookup response", event.data);
                    if (event.data.type === 'OK') {
                        resolve(event.data.possibles);
                    } else {
                        reject(event.data);
                    }
                };
                w.postMessage(query);
            });
            return p;
        }
    }
    return new Arbiter();
}]);