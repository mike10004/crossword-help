angular.module('crosswordHelpApp').factory('Log', 
['$log', function($log){
    const logLevel = 'debug';
    const LEVELS = ['error', 'warn', 'info', 'debug'];
    const OTHER_METHODS = ['log', 'trace'];
    const facade = {
    };
    OTHER_METHODS.forEach(method => facade[method] = $log[method]);
    for (let i = 0; i < LEVELS.length; i++) {
        facade[LEVELS[i]] = $log[LEVELS[i]];
        if (LEVELS[i] === logLevel) {
            break;
        }
    }
    return facade;
}]);