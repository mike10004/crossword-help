class FakeWarehouse {
    constructor(words) {
        this.words = words || [];
        this.fail = false;
    }

    stock(words) {
        this.words = words || [];
    }

    fetch() {
        console.info('FakeWarehouse.fetch');
        const self = this;
        const promise = new Promise(function(resolve, reject){
            if (self.fail) {
                reject('fake failure');
            } else {
                resolve(self.words);
            }
        });
        return promise;
    }
}