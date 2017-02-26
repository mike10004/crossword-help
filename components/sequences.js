'use strict';

angular.module('crosswordHelpApp').factory('Sequences', ['Log', 'Warehouse', function(Log, Warehouse) {
    
    const DB_NAME = 'SequenceDb';
    const DB_VERSION = 1;

    function checkDatabase(db) {
        Log.debug ("checkDatabase", db.name, db.verno);
        const tables = [];
        db.tables.forEach(table => tables.push(table));
        Log.debug("tables", tables.map(t => t.name));
        if (tables[0] && tables[0].name === 'assets') {
            db.assets = angular.isUndefined(db.assets) ? tables[0] : db.assets; // because dexie hates me
            return true;
        } else {
            Log.info("'assets' table does not exist");
        }
        return false;
    }

    class SequenceStore {
        constructor() {
            const self = this;
            const db = new Dexie(DB_NAME);
            self.dbPromise = new Promise(function(resolve, reject){
                db.open()
                  .then(function (db) { // if database has already been created
                    Log.debug("database already exists");
                    if (checkDatabase(db)) {
                        resolve(db);
                    } else {
                        reject("database failed integrity check");
                    }
                }).catch('NoSuchDatabaseError', function(e) {  // Database has not yet been created
                    Log.debug("creating new database");
                    db.version(DB_VERSION).stores({
                        assets: `sequence, length`
                    });
                    db.open().then(function(){
                        Log.debug("fetching word list from", Warehouse);
                        Warehouse.fetch().then(function populate(sequences) {
                            Log.debug("populating word list");
                            db.transaction('rw', db.assets, function(){
                                sequences.forEach(sequence => db.assets.add({
                                    'sequence': sequence,
                                    'length': sequence.length
                                }));
                            }).then(() => {
                                Log.debug("inserted words", sequences.length);
                                resolve(db);
                            }).catch(reject); // db transaction
                        }).catch(reject); // Warehouse.fetch
                    }).catch(reject); // db opening
                }).catch(reject); // db opening error that is not NoSuchDatabaseError
            });
        }
    }
    const store = new SequenceStore();
    Log.debug("Sequences: constructed SequenceStore");
    
    function escapeChar(ch) {
        if (ch.length !== 1) {
            throw Error('expected character, not string of length ' + ch.length);
        }
        if (/\w/i.test(ch)) {
            return ch;
        } else {
            return "\\" + ch;
        }
    }

    function findMatches(sequences, template) {
        var pattern = '^' + template.split('').map(ch => ch == '_' ? '.' : escapeChar(ch)).join('') + '$';
        var re = new RegExp(pattern, 'i');
        var matches = sequences.filter(word => re.test(word));
        Log.debug('findMatches', re.source, sequences.length, matches.length);
        return matches;
    }

    class SequenceLookup {
        constructor() {
        }

        lookup(template) { // return promise resolving with list of matching sequences
            const p = new Promise(function(resolve, reject){
                store.dbPromise.then(function(db){
                    const assets = db.assets;
                    Log.debug("looking up template " + template + " in " + assets.name);
                    assets
                        .where('length')
                        .equals(template.length)
                        .primaryKeys(function(sequences) {
                            var matches = findMatches(sequences, template);
                            Log.debug("filtered " + sequences.length + " sequences to " + matches.length);
                            resolve(matches);
                        }).catch(e => reject(e));                    
                }).catch(reject);
            });
            return p;
        }
    }
    Log.debug("Sequences: returning new SequenceLookup");
    return new SequenceLookup();
}]);
