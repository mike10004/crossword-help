'use strict';

angular.module('crosswordHelpApp').factory('Sequences', ['Log', 'Warehouse', function(Log, Warehouse) {
    
    const DB_NAME = 'SequenceDb';
    const DB_VERSION = 2;

    function checkDatabase(db) {
        const tables = [];
        db.tables.forEach(table => tables.push(table));
        Log.debug ("Sequences.checkDatabase", db.name, db.verno, tables.map(t => t.name));
        if (tables[0] && tables[0].name === 'assets') {
            db.assets = angular.isUndefined(db.assets) ? tables[0] : db.assets; // because dexie hates me
            return true;
        } else {
            Log.info("'assets' table does not exist");
        }
        return false;
    }

    const ASSET_PROP_NAMES = {
        'sq': 'sequence',
        'rs': 'renderings',
        'vp': 'vowel_pattern'
    };

    class Asset {
        /**
         * @param {object|string} asset string or object with asset properties
         */
        constructor(asset) {
            if (angular.isString(asset)) {
                asset = {
                    sq: asset
                };
            }
            this.length = asset.sq.length;
            for (let k in ASSET_PROP_NAMES) {
                if (ASSET_PROP_NAMES.hasOwnProperty(k)) {
                    this[ASSET_PROP_NAMES[k]] = asset[k];
                }
            } 
        }
    }

    class SequenceStore {
        constructor() {
            const self = this;
            const db = new Dexie(DB_NAME);
            const CN = 'SequenceStore';
            self.databaseOpenAction = 'none';

            self.dbPromise = new Promise(function(resolve, reject){
                db.open()
                  .then(function (db) { // if database has already been created
                    Log.debug(CN, "database already exists");
                    if (checkDatabase(db)) {
                        self.databaseOpenAction = 'existing';
                        resolve(db);
                    } else {
                        reject("database failed integrity check");
                    }
                }).catch('NoSuchDatabaseError', function(e) {  // Database has not yet been created
                    Log.debug(CN, "creating new database");
                    db.version(DB_VERSION).stores({
                        assets: `sequence, length, renderings`
                    });
                    db.open().then(function(){
                        Log.debug(CN, "fetching word list from", Warehouse);
                        Warehouse.fetch().then(function populate(assets) {
                            Log.debug("populating word list");
                            db.transaction('rw', db.assets, function(){
                                assets.forEach(asset => db.assets.add(new Asset(asset)));
                            }).then(() => {
                                Log.debug(CN, "inserted assets", assets.length);
                                self.databaseOpenAction = 'created';
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
        Log.debug('Sequences.findMatches', template, re.source);
        return matches;
    }

    const DEFAULT_LOOKUP_OPTIONS = {
        offset: 0,
        limit: 50
    };

    class SequenceLookup {

        getDatabaseName() {
            return DB_NAME;
        }

        getDatabaseOpenAction() {
            return store.databaseOpenAction;
        }

        /**
         * Modifies an array of matches according to given options.
         * @returns {array} same argument array modified
         */
        apply(options, matches) {
            matches.splice(0, Math.min(options.offset, matches.length));
            if (matches.length > options.limit) {
                matches.splice(options.limit, matches.length - options.limit); 
            }
            return matches;
        }

        /**
         * Looks up matches for a given template.
         * @returns {Promise} promise that resolves with list of matches
         */
        lookup(template, options) { 
            options = angular.extend({}, DEFAULT_LOOKUP_OPTIONS, options || {});
            const self = this;
            return new Promise(function(resolve, reject){
                store.dbPromise.then(function(db){
                    const assets = db.assets;
                    Log.debug("SequenceLookup: template", template, assets.name, options);
                    assets
                        .where('length')
                        .equals(template.length)
                        .primaryKeys(function(sequences) {
                            var matches = findMatches(sequences, template);
                            Log.debug("SequenceLookup: filtered sequences", sequences.length, matches.length);
                            resolve(self.apply(options, matches));
                        }).catch(e => reject(e));                    
                }).catch(reject);
            });
        }
    }
    Log.debug("Sequences: returning new SequenceLookup");
    return new SequenceLookup();
}]);
