/* global FakeWarehouse */

fdescribe('Sequences', function() {
    const FAKE_WAREHOUSE = new FakeWarehouse();
    beforeEach(module('crosswordHelpApp'));
    beforeEach(module(function($provide) {
        $provide.value('$log', console);
        $provide.value('Warehouse', FAKE_WAREHOUSE);
    }));
    let Sequences;
    beforeEach(inject(function(_Sequences_){
        Sequences = _Sequences_;
    }));
    afterEach(function(done){
        FAKE_WAREHOUSE.stock([]); // clear warehouse
        Dexie.delete(Sequences.getDatabaseName()).then(() => done()).catch(() => done.fail());
    });
    
    it("lookup", function(done) {
        expect(Sequences).toBeDefined();
        FAKE_WAREHOUSE.stock(['beans', 'cabbage', 'cars', 'trees', 'steel', 'trucks', 'ascot']);
        Sequences.lookup('____S')
                .then(results => {
                    console.debug(results.length, "results", results);
                    expect(results).toEqual(['beans', 'trees']);
                    done();
                }).catch(e => done.fail(e));
    });

});
