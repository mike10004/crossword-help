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

        self.removeClicked = function() {
            Log.debug("CellController.removeClicked");
            self.playgroundCtrl.model.remove(self.model);
        };

        function isBlanker($event) {
            return $event.key === 'Delete' || $event.key === 'Backspace' || $event.key === ' ';
        }

        function isLetter($event) {
            return /^[A-Z]$/i.test($event.key);
        }

        function toMovement($event) {
            if (isLetter($event)) {
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
            if (isBlanker($event)) {
                self.model.value = '';
            } else if (isLetter($event)) {
                self.model.value = clean($event.key);
            }
            const movement = toMovement($event);
            self.playgroundCtrl.keyed($event, self.model, movement);
        };
    }],
    require: {
        playgroundCtrl: '^xhPlayground'
    }
  });