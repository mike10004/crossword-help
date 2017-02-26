'use strict';

describe('my app', function() {

  it('should automatically redirect to /home when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/home");
  });


  describe('home', function() {

    beforeEach(function() {
      browser.get('index.html#!/home');
    });


    it('should render home when user navigates to /home', function() {
      expect(element.all(by.css('[ng-view] h1')).first().getText()).
        toMatch(/Crossword Help/);
    });

    xit('should get results from Arbiter', function(){
      expect(element.all(by.css('.playground')).first().getText()).toMatch(/hello world/);
    });
  });

});
