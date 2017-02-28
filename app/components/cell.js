angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', function CellController(Log) {
        const self = this;
        self.inputChanged = function() {
            Log.debug("CellController.inputChanged", self.model.value);
            let cleaned = self.model.value.trim();
            if (cleaned.length > 1) {
                cleaned = cleaned[1];
            }
            self.model.value = cleaned;
        };
    }]
  });