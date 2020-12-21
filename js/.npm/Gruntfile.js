"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    run: {
      // grunt run:doc to generate documentation using global jsdoc
      doc: {
        exec: 'jsdoc -c conf/jsdoc.json'
      },
      // grunt run:jshint to check using global jshint
      jshint: {
        exec: 'jshint .'
      },
      // grunt run:lint to check using global eslint
      //  Configuration is in .eslintrc
      lint: {
        exec: 'eslint *.js __tests__/*.js'
      },
      // grunt run:test to run __test__/*.test.js tests
      // or just grunt since run:test is the default
      test: {
        exec: 'jest'
      }
    },
    srcs: [ "../snow_profile*.js", "!../snow_profile.min.js",
            "./__tests__/*.js", "!./node_modules"]
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-run');

  // Task aliases
  grunt.registerTask('default', ['run:test']);
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
