'use strict';

(function(ng){
    
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
        return event.key === 'ArrowRight' || event.key === 'ArrowLeft';
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

    const DEFAULT_PG_OPTIONS = {
        minNumCells: 3,
        maxNumCells: 25
    };

    class PlaygroundModel {
        
        constructor(initialNumCells, options) {
            this.options = angular.extend({}, DEFAULT_PG_OPTIONS, options);
            this.cells = new Array(initialNumCells || options.minNumCells);
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i] = new Cell();
            }
            this.insertable = this.cells.length < this.options.maxNumCells;
        }

        update() {
            this.insertable = this.cells.length < this.options.maxNumCells;
        }

        toTemplate() {
            return this.cells.map(cell => cell.value || '_').join('');
        }

        toString() {
            var word = this.toTemplate();
            return word + " active=" + this.activeCellIndex;
        }

        insertCell(cell, position) {
            if (position < 0) {
                position = this.cells.length + position;
            }
            if (this.cells.length < this.options.maxNumCells) {
                this.cells.splice(position, 0, cell);
                this.update();
                return true;
            } else {
                return false;
            }
        }

        appendCell() {
            return this.insertCell(new Cell(), this.cells.length);
        }

        prependCell() {
            return this.insertCell(new Cell(), 0);
        }

        remove(cell) {
            if (this.cells.length > this.options.minNumCells) {
                if (!angular.isNumber(cell)) {
                    cell = this.cells.indexOf(cell);
                }
                this.cells.splice(cell, 1);
                return true;
            } else {
                return false;
            }
        }
    }

    ng.module('crosswordHelpApp')
    .component('xhPlayground', {
        templateUrl: 'components/playground.html',
        controller: ['Log', 'Sequences', '$scope', '$element', '$timeout', 
        function PlaygroundController(Log, Sequences, $scope, $element, $timeout) {
            const NAME = 'PlaygroundController';
            Log.debug(NAME);
            const self = this;
            self.possibles = [];
            var updatePossibles = function(possibles) {
                self.possibles = possibles;
            };

            self.model = new PlaygroundModel(5);

            const modelListener = function(currentTemplate, previousTemplate) {
                Log.debug(NAME, 'modelListener', currentTemplate, previousTemplate);
                if (self.searchDisabled) {
                    return;
                }
                Sequences.lookup(currentTemplate)
                    .then(possibles => {
                        Log.debug(NAME, 'modelListener: possibles', possibles.length);
                        $scope.$apply(function(){
                            updatePossibles(possibles);
                        });
                    });
            };
            $scope.$watch(() => self.model.toTemplate(), modelListener);

            $scope.focusTarget = -1;

            function isLetterKeyEvent($event) {
                return /^[a-z]$/i.test($event.key);
            }

            function isAddTriggering($event) {
                return isLetterKeyEvent($event)
                    || $event.key === 'ArrowRight';
            }

            self.keyed = function($event, cell, movement) {
                const $index = self.model.cells.indexOf(cell);                
                Log.debug(NAME, 'keyed', $event.key, $index);
                if (isAddTriggering($event)) {
                    if ($index === self.model.cells.length - 1) {
                        self.model.appendCell(); // might not succeed, if we're at limit
                    }
                }
                const focusTarget = $index + movement;
                $scope.focusTarget = Math.min(focusTarget, self.model.cells.length - 1);
                $scope.focusTarget = Math.max(0, focusTarget);
            };

            $scope.$watch('focusTarget', function(newTarget, oldTarget){
                if (typeof(oldTarget) === 'undefined' || newTarget === oldTarget) {
                    return; // false alarm
                }
                $timeout(function(){
                    var cellElementInputs = $element.find('.actual xh-cell input.letter');
                    Log.debug(NAME, '$watch(focusTarget)', cellElementInputs.length, newTarget, oldTarget);
                    const target = cellElementInputs[newTarget];
                    target.focus();
                });
            });
        }]
    });

})(angular);
