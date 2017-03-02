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
        defaultTemplate: '___',
        maxNumCells: 25
    };

    function templateToCellValue(ch) {
        return /^[A-Z]$/i.test(ch) ? ch : '';
    }

    class PlaygroundModel {
        
        constructor(initial, options) {
            this.options = angular.extend({}, DEFAULT_PG_OPTIONS, options);
            initial = initial || this.options.defaultTemplate;
            this.cells = new Array(initial.length);
            for (let i = 0; i < this.cells.length; i++) {
                this.cells[i] = new Cell(templateToCellValue(initial[i]));
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
    const PARAM_TEMPLATE = 't';

    ng.module('crosswordHelpApp')
    .component('xhPlayground', {
        templateUrl: 'components/playground.html',
        controller: ['Log', 'Sequences', 'KeyEvents', '$scope', '$element', '$timeout', '$location', 
        function PlaygroundController(Log, Sequences, KeyEvents, $scope, $element, $timeout, $location) {
            const NAME = 'PlaygroundController';
            Log.debug(NAME);
            const self = this;
            self.possibles = [];
            let requestId = 0;
            var maybeUpdatePossibles = function(result) {
                Log.debug(NAME, 'maybeUpdatePossibles', requestId, result.toString(), result.paging);
                if (requestId === result.requestId) { // only update if this is the most recent request
                    $scope.$apply(function(){
                        self.possibles = result.matches;
                        self.paging = result.paging;
                    });
                }
            };
            const initialTemplate = $location.search()[PARAM_TEMPLATE];
            self.model = new PlaygroundModel(initialTemplate);

            self.encodeHash = function(currentTemplate) {
                return encodeURIComponent(PARAM_TEMPLATE) + '=' + encodeURIComponent(currentTemplate);
            };

            const modelListener = function(currentTemplate, previousTemplate) {
                Log.debug(NAME, 'modelListener', currentTemplate, previousTemplate);
                $location.search(PARAM_TEMPLATE, currentTemplate);
                if (self.searchDisabled) {
                    return;
                }
                const request = {
                    'template': currentTemplate, 
                    'requestId': ++requestId,
                };
                Sequences.lookup(request)
                        .then(maybeUpdatePossibles)
                        .catch(Log.warn);
            };
            $scope.$watch(() => self.model.toTemplate(), modelListener);

            self.keyed = function($event, cell, movement) {
                const $index = self.model.cells.indexOf(cell);                
                Log.debug(NAME, 'keyed', $event.key, $index);
                if (KeyEvents.isArrowRight($event) && ($index === self.model.cells.length - 1)) {
                    self.model.appendCell(); // might not succeed, if we're at limit
                }
                const focusTarget = $index + movement;
                $scope.focusTarget = Math.min(focusTarget, self.model.cells.length - 1);
                $scope.focusTarget = Math.max(0, focusTarget);
            };

            self.cellFocused = function($event, cell) {
                const $index = self.model.cells.indexOf(cell);
                if ($index !== -1) {
                    $scope.focusTarget = $index;
                }
            };

            $scope.$watch('focusTarget', function(newTarget, oldTarget){
                if (typeof(oldTarget) === 'undefined' || newTarget === oldTarget) {
                    return; // false alarm
                }
                $timeout(function(){
                    var cellElementInputs = $element.find('.actual xh-cell input.letter');
                    Log.debug(NAME, '$watch(focusTarget)', cellElementInputs.length, newTarget, oldTarget);
                    const target = cellElementInputs[newTarget];
                    if (!angular.isUndefined(target)) {
                        target.focus();
                    }
                });
            });

            $scope.$watch(Sequences.getStoreStatus, function(status) {
                self.storeStatus = status;
            });
        }]
    });

})(angular);
