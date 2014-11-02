module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            src: [ 'README.md', '<%= srcs %>' ],
            options:{
                configure: 'jsdoc.json',
                destination: './doc'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: [ '<%= srcs %>' ]
        },
        simplemocha: {
	  options: {
	       timeout: 20000,
	       reporter: 'spec'
          },
          all: {
            src: ['test/**/*.js']
          }
        },
        srcs: [ "snow_profile*.js", "!snow_profile.min.js" ]
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Task aliases
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('doc',     ['jsdoc']);
    grunt.registerTask('test',     ['simplemocha']);
};
