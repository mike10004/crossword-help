angular.module('crosswordHelpApp')
.component('xhCell', {
    bindings: {
        model: '<',
        index: '<',
        focusTarget: '<'
    },
    templateUrl: 'components/cell.html',
    controller: ['Log', 'KeyEvents', '$document', function CellController(Log, KeyEvents, $document) {
        const self = this;
        const CTRL = 'CellController';
        self.removeClicked = function() {
            Log.debug(CTRL, "removeClicked");
            self.playgroundCtrl.model.remove(self.index);
        };

        self.keyDown = function($event) {
            $event = KeyEvents.norm($event);
            Log.debug(CTRL, "keyDown", 'key', $event.key);
            // TODO: only preventDefault if target has focus and no modifier key is down
            if ($document[0].activeElement === $event.target && !KeyEvents.hasCtrlOrAlt($event)) {            
                $event.preventDefault();
                if (KeyEvents.isBlankish($event)) {
                    self.model.value = '';
                } else if (KeyEvents.isLetter($event)) {
                    self.model.value = $event.key;
                }
                const movement = KeyEvents.toMovement($event);
                self.playgroundCtrl.keyed($event, self.index, movement);
            }
        };

        self.focused = function($event, type) {
            Log.debug(CTRL, "focused", type, self.index);
            self.playgroundCtrl.cellFocused(self.index);
        };
    }],
    require: {
        playgroundCtrl: '^xhPlayground'
    }
  });