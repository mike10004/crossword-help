'use strict';

(function(ng){

    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

    function makeEvent(key) {
        return {
            'key': key
        };
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
    const PARAM_TEMPLATE = 't', PARAM_DISABLED = 's';

    ng.module('crosswordHelpApp')
    .component('xhPlayground', {
        templateUrl: 'components/playground.html',
        controller: ['Log', 'Sequences', 'KeyEvents', '$scope', '$element', '$timeout', '$location', 
        function PlaygroundController(Log, Sequences, KeyEvents, $scope, $element, $timeout, $location) {
            const NAME = 'PlaygroundController';
            Log.debug(NAME);
            const self = this;
            self.anyCellHasFocus = false;
            self.searchDisabled = $location.search()[PARAM_DISABLED] === '1';
            self.possibles = [];
            self.qwertyModel = [
                "QWERTYUIOP".split(''),
                "ASDFGHJKL".split(''),
                "ZXCVBNM".split(''),
                ['Backspace', 'Delete', 'Space']
            ];
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

            function entered(key, $index, movement) {
                const focusTarget = $index + movement;
                $scope.focusTarget = Math.min(focusTarget, self.model.cells.length - 1);
                $scope.focusTarget = Math.max(0, focusTarget);
            }

            self.keyed = function($event, $index, movement) {
                Log.debug(NAME, 'keyed', $event.key, $index, movement);
                if (KeyEvents.isArrowRight($event) && ($index === self.model.cells.length - 1)) {
                    self.model.appendCell(); // might not succeed, if we're at limit
                }
                entered($event.key, $index, movement);
            };

            self.buttoned = function(key) {
                const cell = self.model.cells[$scope.focusTarget];
                const event = makeEvent(key);
                if (KeyEvents.isBlankish(event)) {
                    cell.value = '';
                } else if (KeyEvents.isLetter(event)) {
                    cell.value = key;
                } else {
                    Log.warn(NAME, 'buttoned: unhandled', key);
                }
                const movement = KeyEvents.toMovement(event);
                entered(key, $scope.focusTarget, movement);
            };

            self.cellFocused = function($index) {
                $scope.focusTarget = $index;
            };

            $scope.$watch('focusTarget', function(newTarget, oldTarget){
                if (newTarget === oldTarget) {
                    return; // false alarm (inital watch registration)
                }
                self.anyCellHasFocus = newTarget >= 0 && newTarget < self.model.cells.length;
                Log.debug(NAME, '$watch(focusTarget)', newTarget, self.anyCellHasFocus);
                $timeout(function(){
                    var cellElementInputs = $element.find('.actual xh-cell input.letter');
                    Log.debug(NAME, '$watch(focusTarget)', cellElementInputs.length, newTarget, oldTarget);
                    const target = cellElementInputs[newTarget];
                    if (!angular.isUndefined(target)) {
                        target.focus();
                    }
                });
            });

            $scope.$watch(() => Sequences.getStoreStatus(), function(status) {
                Log.debug(NAME, "$watch(Sequences.getStoreStatus)", status);
                self.storeStatus = status;
            });

            $scope.$watch(() => self.searchDisabled, function(nw, old){
                if (!angular.isUndefined(old) && (nw !== old)) {
                    if (nw) {
                        $location.search(PARAM_DISABLED, '1');
                    } else {
                        $location.search(PARAM_DISABLED, null);
                    }
                }
            });
        }]
    });

})(angular);
