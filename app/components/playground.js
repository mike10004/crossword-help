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

    class PlaygroundModel {
        
        constructor(numCells) {
            this.cells = new Array(numCells || DEFAULT_NUM_CELLS);
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i] = new Cell();
            }
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
            const NAME = 'PlaygroundController'
            Log.debug(NAME);
            const self = this;
            self.possibles = [];
            var updatePossibles = function(possibles) {
                self.possibles = possibles;
            };

            const modelListener = function(currentTemplate, previousTemplate) {
                Log.debug(NAME, 'modelListener', currentTemplate, previousTemplate);
                Sequences.lookup(currentTemplate)
                    .then(possibles => {
                        Log.debug(NAME, 'modelListener: possibles', possibles.length);
                        $scope.$apply(function(){
                            updatePossibles(possibles);
                        });
                    });
            };
            self.model = new PlaygroundModel(5);
            self.blurred = function($event) {
                Log.debug(NAME, "blurred");
                self.model.deactivate();
            };

            $scope.$watch(function() {
                return self.model.toTemplate();
            }, modelListener);
        }]
    });

})(angular);
