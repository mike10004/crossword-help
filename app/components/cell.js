angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['$log', function PlaygroundController($log) {
        $log.debug('xhCell', this.model);
    }]
  });