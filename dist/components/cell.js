angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', function CellController(Log) {
        const self = this;

        function clean(value) {
            let cleaned = (value || '').trim();
            if (cleaned.length > 1) {
                cleaned = cleaned[1];
            }
            return cleaned;
        }

        self.inputChanged = function() {
            Log.debug("CellController.inputChanged", self.model.value);
            self.model.value = clean(self.model.value);
        };

        self.removeClicked = function() {
            Log.debug("CellController.removeClicked");
            self.playgroundCtrl.model.remove(self.model);
        };

        self.keyUp = function($event) {
            Log.debug("CellController.keyUp");
            if ($event.key === 'Delete') {
                self.model.value = '';
            }
        };
    }],
    require: {
        playgroundCtrl: '^xhPlayground'
    }
  });