/*global module:false*/
module.exports = function (grunt) {

    // Gets inserted at the top of the generated files in dist/.
    var BANNER = [
        '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n'
    ].join('');

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        browserify: {

            atrspb: {
                src: ['src/js/atrspb.js'],
                dest: 'atrspb.js',
                options: {
                    external: ['moysklad-client', 'xmldom'],
                    alias: [
                        './src/js/atrspb.js:atrspb'
                    ],
                    // wrapp as Taist addon
                    postBundleCB: function (err, src, next) {
                        src = 'function init(){var ' + src + ';return require("atrspb")}';
                        next(err, src)
                    }
                }
            }
        }

    });

    grunt.registerTask('default', [
        'browserify:atrspb'
    ]);

};
