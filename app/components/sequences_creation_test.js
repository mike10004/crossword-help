/* global FakeWarehouse */

describe('Sequences: create first, else use existing', function() {
    const FAKE_WAREHOUSE = new FakeWarehouse();
    FAKE_WAREHOUSE.stock(['apples', 'peaches', 'pumpkin', 'pie']);
    beforeEach(module('crosswordHelpApp'));
    beforeEach(module(function($provide) {
        $provide.value('$log', console);
        $provide.value('Warehouse', FAKE_WAREHOUSE);
    }));
    let Sequences;
    beforeEach(inject(function(_Sequences_){
        Sequences = _Sequences_;
    }));
    const openActions = [];
    afterEach(function(){
        console.debug('openActions', openActions);
        if (openActions.length === 2) {
            expect(openActions[0]).toEqual('created');
            expect(openActions[1]).toEqual('existing');
            window.indexedDB.deleteDatabase(Sequences.getDatabaseName());
        }
    });


    it("lookup1", function(done) {
        Sequences.lookup('x').then(function(){
            openActions.push(Sequences.getDatabaseOpenAction());
            done();
        }).catch(err => done.fail(err));
    });

    it("lookup2", function(done) {
        Sequences.lookup('x').then(function(){
            openActions.push(Sequences.getDatabaseOpenAction());
            done();
        }).catch(err => done.fail(err));
    });
});
