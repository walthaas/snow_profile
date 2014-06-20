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
        srcs: [ "snow_profile*.js", "!snow_profile.min.js" ]
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');

    // Task aliases
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('doc',     ['jsdoc']);
};
