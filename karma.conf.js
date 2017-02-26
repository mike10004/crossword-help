//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './app',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/dexie/dist/dexie.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      '../testing/**/*.js',
      'app.js',
      'components/**/*.js',
      'home/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine', 'jasmine-matchers'],

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine-matchers',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
