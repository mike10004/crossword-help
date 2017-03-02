angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', 'KeyEvents', function CellController(Log, KeyEvents) {
        const self = this;

        self.removeClicked = function() {
            Log.debug("CellController.removeClicked");
            self.playgroundCtrl.model.remove(self.model);
        };

        function toMovement($event) {
            if (KeyEvents.isLetter($event)) {
                return 1;
            }
            switch ($event.key) {
                case 'Backspace':
                case 'ArrowLeft':
                    return -1;
                case 'ArrowRight':
                case ' ':
                    return 1;
                default:
                    return 0;
            }
        }

        self.keyDown = function($event) {
            Log.debug("CellController.keyDown", $event.key);
            $event.preventDefault();
            if (KeyEvents.isBlankish($event)) {
                self.model.value = '';
            } else if (KeyEvents.isLetter($event)) {
                self.model.value = $event.key;
            }
            const movement = toMovement($event);
            self.playgroundCtrl.keyed($event, self.model, movement);
        };

        self.focused = function($event) {
            self.playgroundCtrl.cellFocused($event, self.model);
        };
    }],
    require: {
        playgroundCtrl: '^xhPlayground'
    }
  });