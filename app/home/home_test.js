'use strict';

describe('crosswordHelpApp module', function() {

  beforeEach(module('crosswordHelpApp'));

  describe('home controller', function(){

    it('should ....', inject(function($controller, $rootScope) {
      //spec body
      var homeCtrl = $controller('HomeCtrl', {'$scope': $rootScope.$new()});
      expect(homeCtrl).toBeDefined();
    }));

  });
});