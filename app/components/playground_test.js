/* global FakeWarehouse */

describe('component: playground', function() {
  let $componentController, $rootScope;
  const fakeWarehouse = new FakeWarehouse();
  beforeEach(module('crosswordHelpApp'));
  beforeEach(module(function($provide){
      $provide.value('Warehouse', fakeWarehouse);
  }));
  beforeEach(inject(function(_$componentController_, _$rootScope_) {
    $componentController = _$componentController_;
    $rootScope = _$rootScope_;
  }));

  it('should expose a `possibles` array', function() {
    let ctrl = $componentController('xhPlayground', {'$element': null, '$scope': $rootScope.$new()});
    expect(ctrl.possibles).toBeArray();
    expect(ctrl.possibles.length).toEqual(0);
  });

//   it('should populate possibles list when model changes', function(done) {
//     let $scope = $rootScope.$new();
//     const locals = {
//         '$element': null,
//         '$scope': $scope
//     };
//     let ctrl = $componentController('xhPlayground', locals);
//     console.debug('possibles', ctrl.possibles);
//     $scope.$digest();
//   });

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