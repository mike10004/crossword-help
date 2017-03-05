angular.module('crosswordHelpApp').factory('KeyEvents', ['Log', function(Log){

    class KeyEvents {

        isBlankish($event) {
            return $event.key === 'Delete' || $event.key === 'Backspace' || $event.key === ' ';
        }

        isLetter($event) {
            return /^[A-Z]$/i.test($event.key);
        }

        isArrowRight($event) {
            return $event.key === 'ArrowRight';
        }

        isArrowLeft($event) {
            return $event.key === 'ArrowLeft';
        }

        isHorizontal($event) {
            return this.isArrowRight($event) || this.isArrowLeft($event);
        }

        hasCtrlOrAlt($event) {
            return $event.altKey || $event.metaKey || $event.ctrlKey;            
        }

        norm($event) {
            if (angular.isUndefined($event.key) || $event.key === 'Unidentified') {
                Log.info('KeyEvents: event.key is undefined/Unidentified', 'charCode', $event.charCode, 'code', $event.code, 'keyCode', $event.keyCode);
            }
            Log.debug('KeyEvents $event.key=' + $event.key);
            return $event;
        }

        toMovement($event) {
            if (this.isLetter($event)) {
                return 1;
            }
            switch ($event.key) {
                case 'Backspace':
                case 'ArrowLeft':
                    return -1;
                case 'ArrowRight':
                case ' ':
                case 'Space':
                    return 1;
                default:
                    return 0;
            }
        }

    }

    return new KeyEvents();
}]);