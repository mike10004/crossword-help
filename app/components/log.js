angular.module('crosswordHelpApp').factory('Log', 
['$log', function($log){
    const retention = 100;
    const logLevel = 'debug';
    const LEVELS = ['error', 'warn', 'info', 'debug'];
    const OTHER_METHODS = ['log', 'trace'];
    class LogEntry {
        constructor(level, message) {
            this.level = level;
            this.message = message;
            this.duplicate = false;
            this.repeated = 0;
            if (message.length === 0) {
                this.rendering = '[]';
            } else if (message.length === 1) {
                this.rendering = message[0] || '<empty>';
            }
        }
        render() {
            this.rendering = this.message.join(', ');
            return this.rendering;
        }
    }
    const facade = {
    };
    facade.entries = [];
    function elementwiseEqual(array1, array2) {
        const undef1 = angular.isUndefined(array1), undef2 = angular.isUndefined(array2);
        if (undef1 || undef2) {
            return undef1 && undef2;
        }
        if (array1.length !== array2.length) {
            return false;
        }
        if (array1.length === 0) {
            return true;
        }
        for (let i = 0; i < array1.length; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }
    const wrap = function(level) {
        return function() {
            $log[level].apply($log, arguments);
            const message = Array.prototype.map.call(arguments, angular.identity);
            const previous = facade.entries[facade.entries.length - 1];
            if (!angular.isUndefined(previous) && elementwiseEqual(message, previous.message)) {
                previous.duplicate = true;
                previous.repeated++;
            } else {
                facade.entries.push(new LogEntry(level, message));
                const numToRemove = Math.max(0, facade.entries.length - retention);
                facade.entries.splice(0, numToRemove);
            }
        };
    };
    OTHER_METHODS.forEach(method => facade[method] = $log[method]);
    for (let i = 0; i < LEVELS.length; i++) {
        const level = LEVELS[i];
        if (i <= LEVELS.indexOf(logLevel)) {
            if (retention === 0) {
                facade[level] = $log[level];
            } else {
                facade[level] = wrap(level);
            }
        } else {
            facade[level] = angular.noop;
        }
    }
    return facade;
}]).component('xhLogbook', {
    template: '' + 
                '<div ng-repeat="entry in $ctrl.entries">' + 
                  '<div ng-class="entry.level">{{entry.rendering || entry.render()}}</div>' + 
                '</div>' + 
              '',
    controller: ['Log', function(Log){
        this.entries = Log.entries;
    }]
});