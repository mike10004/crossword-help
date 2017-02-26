angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', function PlaygroundController(Log) {
        Log.debug('xhCell', this.model);
        this.keyUp = function($event) {
            Log.debug("cell keyUp", $event.code);
        };
    }]
  });