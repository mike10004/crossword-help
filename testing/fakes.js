class FakeWarehouse {
    constructor(words) {
        this.words = words || [];
        this.fake = true;
    }

    stock(words) {
        this.words = words || [];
    }

    fetch() {
        console.info('FakeWarehouse.fetch');
        const self = this;
        const promise = new Promise(function(resolve, reject){
            resolve(self.words);
        });
        return promise;
    }
}