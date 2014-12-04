module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc: {
            src: [ 'README.md', '<%= srcs %>' ],
            options:{
                configure: 'conf/jsdoc.json',
                destination: './doc'
            }
        },
        eslint: {
          options: {
	    config: 'conf/eslint.json'
	  },
	  target: [ '<%= srcs %>' ]
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
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Task aliases
    grunt.registerTask('default', ['eslint']);
    grunt.registerTask('doc',     ['jsdoc']);
    grunt.registerTask('test',     ['simplemocha']);
};
