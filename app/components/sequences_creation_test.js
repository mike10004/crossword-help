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
    afterEach(function(done){
        //Sequences.shutdown();
        console.debug('openActions', openActions);
        if (openActions.length === 2) {
            expect(openActions[0]).toEqual('created');
            expect(openActions[1]).toEqual('existing');
            Dexie.delete(Sequences.getDatabaseName()).then(() => done());
            // const delPromise = window.indexedDB.deleteDatabase(Sequences.getDatabaseName());
            // console.info("delPromise", delPromise, typeof(delPromise));
            // delPromise.then(() => done());
//            window.indexedDB.deleteDatabase(Sequences.getDatabaseName());
        } else {
            done();
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
