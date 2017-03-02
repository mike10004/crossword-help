angular.module('crosswordHelpApp').factory('KeyEvents', [function(){

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
    }

    return new KeyEvents();
}]);