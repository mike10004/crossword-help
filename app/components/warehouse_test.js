'use strict';

describe('Warehouse', function(){
    beforeEach(module('crosswordHelpApp'));
    
    it("fetch", inject(function(Warehouse, $httpBackend){
        $httpBackend.expectGET('data/assets.json').respond(['a', 'b', 'c']);
        Warehouse.fetch().then(function(words){
            console.debug("Warehouse.fetch returned", words);
            expect(words).toEqual(['a', 'b', 'c']);
        }).catch(function(e){
            console.error(e);
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    }));
});

