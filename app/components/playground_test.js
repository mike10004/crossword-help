describe('component: playground', function() {
  var $componentController;

  beforeEach(module('crosswordHelpApp'));
  beforeEach(inject(function(_$componentController_) {
    $componentController = _$componentController_;
  }));

  it('should expose a `possibles` array', function() {
    var ctrl = $componentController('xhPlayground', {'$element': null});
    expect(ctrl.possibles).toBeArray();
    expect(ctrl.possibles.length).toEqual(0);
  });

  xit('should populate possibles list when model changes', function() {
    var ctrl = $componentController('xhPlayground', {'$element': null});
    console.debug(ctrl); // TODO modify cells and call $digest
  });
});

angular.module('crosswordHelpApp').component('keyTest', {
    template: '<div><input ng-model="$ctrl.value" ' 
    + 'ng-keyup="$ctrl.keyup($event)" ' 
    + 'ng-keypress="$ctrl.keypress($event)" ' 
    + 'ng-keydown="$ctrl.keydown($event)" ' 
    + 'ng-change="$ctrl.change()"></div>',
    controller: function(Log) {
        this.keyup = $event => Log.debug('keyup', $event.key);
        this.keypress = $event => Log.debug('keypress', $event.key);
        this.keydown = $event => {
            Log.debug('keydown', $event.key);
            $event.preventDefault();
        };
        this.change = () => Log.debug('change', this.value);
    }
});