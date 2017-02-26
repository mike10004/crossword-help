(function(ng){

    const DEFAULT_NUM_CELLS = 6;
    const SPACE = ' ';
    
    function cleanValue(value) {
        value = (value || '').toString().toUpperCase();
        if (value === ' ') {
            return '';
        }
        if (value >= 'A' && value <= 'Z') {
            return value;
        } 
        return false;
    }

    function isHorizontalArrowKey(event) {
        return event.code === 'ArrowRight' || event.code === 'ArrowLeft';
    }

    function toHorizontalMovement(event) {
        switch (event.code) {
            case 'ArrowRight':
                return 1;
            case 'ArrowLeft':
                return -1;
            default:
                return 0;
        }
    }


    class Cell {
        constructor(value) {
            this.value = value || '';
        }

        setValue(value) {
            const cleaned = cleanValue(value, this.value);
            this.value = cleaned === false ? this.value : cleaned;
        }

        clear() {
            this.value = '';
        }
    }

    const DEACTIVATED = -1;

    class PlaygroundModel {
        
        constructor(numCells, subscriber) {
            this.activeCellIndex = DEACTIVATED;
            this.cells = new Array(numCells || DEFAULT_NUM_CELLS);
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i] = new Cell();
            }
            this.subscriber = subscriber || angular.noop;
        }

        clamp(index) {
            return index < 0 ? 0 : (index >= this.cells.length ? this.cells.length - 1 : index);
        }

        setActive(index) {
            this.activeCellIndex = this.clamp(index);
        }

        deactivate() {
            this.activeCellIndex = DEACTIVATED;
        }

        move(delta) {
            const oldIndex = this.activeCellIndex;
            this.setActive(this.activeCellIndex + delta);
            const newIndex = this.activeCellIndex;
            return newIndex - oldIndex;
        }

        isPlaying() {
            return this.activeCellIndex >= 0;
        }

        getActiveCell() {
            return this.cells[this.activeCellIndex];
        }

        enter(keyEvent) {
            let movement = 0;
            let allowPropagation = false;
            const active = this.getActiveCell();
            const previous = this.toTemplate();
            if (keyEvent.code === 'Backspace') {
                active.clear();
                movement = -1;
            } else if (keyEvent.code === 'Delete') {
                active.clear();
                movement = 0;
            } else if (keyEvent.code === 'Space') {
                active.clear();
                movement = 1;
            } else if (/^[A-Z]$/i.test(keyEvent.key)) {
                active.setValue(keyEvent.key);
                movement = 1;
            } else if (isHorizontalArrowKey(keyEvent)) {
                movement = toHorizontalMovement(keyEvent);
            } else { 
                allowPropagation = true;
            }
            const actualMove = this.move(movement);
            const current = this.toTemplate();
            if (previous !== current) {
                this.subscriber(current, previous);
                return true;
            }
            return actualMove !== 0;
        }

        toTemplate() {
            return this.cells.map(cell => cell.value || '_').join('');
        }

        toString() {
            var word = this.toTemplate();
            return word + " active=" + this.activeCellIndex;
        }
    }

    ng.module('crosswordHelpApp')
    .component('xhPlayground', {
        // scope: {},
        templateUrl: 'components/playground.html',
        controller: ['Log', 'Sequences', '$scope', function PlaygroundController(Log, Sequences, $scope) {
            Log.debug('PlaygroundController');
            const self = this;
            self.possibles = [];
            var updatePossibles = function(possibles) {
                self.possibles = possibles;
            };

            const modelListener = function(currentTemplate, previousTemplate) {
                Log.debug('modelListener', currentTemplate, previousTemplate);
                Sequences.lookup(currentTemplate)
                    .then(possibles => {
                        Log.debug('modelListener: possibles', possibles.length);
                        $scope.$apply(function(){
                            updatePossibles(possibles);
                        });
                    });
            };
            self.model = new PlaygroundModel(5, modelListener);
            self.blurred = function($event) {
                Log.debug("blurred");
                self.model.deactivate();
            }
        }]
    });

})(angular);
