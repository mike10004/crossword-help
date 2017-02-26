angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', function PlaygroundController(Log) {
        Log.debug('xhCell', this.model);
        this.inputChanged = function() {
            Log.debug("cell changed");
        };
    }]
  });