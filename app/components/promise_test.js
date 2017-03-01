
angular.module('crosswordHelpApp').factory('PromiseTest', function(){
    
    function addOne(x) {
        return new Promise(function(resolve){
            resolve(x + 1);
        });
    }

    function squarePlus(x) {
        return new Promise(function(resolve){
            resolve(addOne(x * x));
        });
    }

    function sqrt(x) {
        return new Promise(function(resolve, reject){
            if (x >= 0) {
                resolve(Math.sqrt(x));
            } else {
                reject('argument must be nonnegative: ' + x);
            }
        });
    }
    
    function invertAndSqrt(x) {
        return new Promise(function(resolve) {
            resolve(sqrt(-x));
        });
    }

    class Tester {
        doSquareAndAddOne(x) {
            const self = this;
            return squarePlus(x).then(y => self.result = y);
        }
        doInvertAndSqrt(x) {
            const self = this;
            return invertAndSqrt(x).then(y => self.result = y);
        }
    }
    return new Tester();
});

describe("PromiseTest", function() {
    beforeEach(module('crosswordHelpApp'));
    let PromiseTest;
    beforeEach(inject(function(_PromiseTest_){
        PromiseTest = _PromiseTest_;
        delete PromiseTest.result;
    }));    
    it("doSquareAndAddOne", function(done){
        PromiseTest.doSquareAndAddOne(3).then(function(result){
            console.debug("doSquareAndAddOne result", result);
            expect(result).toEqual(3 * 3 + 1);
            done();
        }).catch(function(err){
            done.fail(err);
        });
    });
    it("doInvertAndSqrt succeed", function(done){
        PromiseTest.doInvertAndSqrt(-9).then(function(result){
            console.debug("doInvertAndSqrt result", result);
            expect(result).toEqual(3);
            done();
        }).catch(function(err){
            done.fail(err);
        });
    });
    it("doInvertAndSqrt fail", function(done){
        PromiseTest.doInvertAndSqrt(3).then(function(result){
            console.debug("doInvertAndSqrt result", result);
            done.fail("should have failed");
        }).catch(function(err){
            console.debug("as expected, excepted: " + err);
            expect(PromiseTest.result).toBeUndefined();
            done(err);
        });
    });
});

