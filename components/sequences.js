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

    const STATUS_PENDING = 'pending';
    const STATUS_READY = 'ready';

    class SequenceStore {
        constructor() {
            const self = this;
            const db = new Dexie(DB_NAME);
            const CN = 'SequenceStore';
            self.databaseOpenAction = 'none';
            self.status = STATUS_PENDING;
            function doResolve(resolve, resolution) {
                resolve(resolution);
                self.status = STATUS_READY;
            }
            self.dbPromise = new Promise(function(resolve, reject){
                db.open()
                  .then(function (db) { // if database has already been created
                    Log.debug(CN, "database already exists");
                    if (checkDatabase(db)) {
                        self.databaseOpenAction = 'existing';
                        doResolve(resolve, db);
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
                                doResolve(resolve, db);
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

    function findMatches(assets, template) {
        var pattern = '^' + template.split('').map(ch => ch == '_' ? '.' : escapeChar(ch)).join('') + '$';
        var re = new RegExp(pattern, 'i');
        var matches = assets.filter(asset => re.test(asset.sequence));
        Log.debug('Sequences.findMatches', template, re.source);
        return matches;
    }

    const DEFAULT_LOOKUP_OPTIONS = {
        offset: 0,
        limit: 1000
    };

    class Paging {
        constructor(offset, limit, total, actual) {
            this.offset = offset;
            this.limit = limit;
            this.total = total;
            this.actual = actual;
        }
    }

    class LookupResult {
        constructor(matches, requestId, paging) {
            this.matches = matches;
            this.requestId = requestId;
            this.paging = paging;
        }

        toString() {
            return 'LookupResult{requestId=' + this.requestId + ',matches.length=' + this.matches.length + '}';
        }
    }

    class SequenceLookup {

        getDatabaseName() {
            return DB_NAME;
        }

        /**
         * Gets a code indicating the action taken when opening the database was requested.
         * This is for testing purposes, to evaluate whether subsequent launches use an existing
         * database.
         * @returns {string} action code, 'none', 'created', or 'existing'
         */
        getDatabaseOpenAction() {
            return store.databaseOpenAction;
        }

        getStoreStatus() {
            return store.status;
        }

        /**
         * Modifies an array of matches according to given options.
         * @returns {object} paging object
         */
        apply(options, matches) {
            const total = matches.length;
            matches.splice(0, Math.min(options.offset, matches.length));
            if (matches.length > options.limit) {
                matches.splice(options.limit, matches.length - options.limit); 
            }
            return new Paging(options.offset, options.limit, total, matches.length);
        }

        /**
         * Looks up matches for a given template.
         * @param {object} request object with 'template' and 'requestId' properties
         * @param {object} options options object
         * @returns {Promise} promise that resolves with LookupResult object
         */
        lookup(request, options) {
            const template = angular.isString(request) ? request : request.template;
            const requestId = request.requestId;
            options = angular.extend({}, DEFAULT_LOOKUP_OPTIONS, options || {});
            const self = this;
            return new Promise(function(resolve, reject){
                store.dbPromise.then(function(db){
                    const assets = db.assets;
                    Log.debug("SequenceLookup: template", template, assets.name, options);
                    assets.where('length')
                        .equals(template.length)
                        .toArray()
                        .then(function(assets) {
                            let matches = findMatches(assets, template);
                            Log.debug("SequenceLookup: filtered sequences", assets.length, matches.length);
                            const paging = self.apply(options, matches);
                            resolve(new LookupResult(matches, requestId, paging));
                        }).catch(reject);                    
                }).catch(reject);
            });
        }
    }
    Log.debug("Sequences: returning new SequenceLookup");
    return new SequenceLookup();
}]);
