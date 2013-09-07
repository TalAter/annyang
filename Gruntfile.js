module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        'Gruntfile.js',
        'annyang.js',
        'sites/facebook.js'
      ],
      options: {
        "node"      : true,
        "browser"   : true,
        "devel"     : false,
        "camelcase" : true,
        "curly"     : true,
        "latedef"   : true,
        "unused"    : true,
        "trailing"  : true,
        "eqeqeq"    : true,
        "eqnull"    : true,
        "evil"      : false,
        "forin"     : true,
        "immed"     : true,
        "laxbreak"  : false,
        "newcap"    : true,
        "noarg"     : true,
        "noempty"   : false,
        "nonew"     : true,
        "onevar"    : false,
        "plusplus"  : false,
        "undef"     : true,
        "sub"       : true,
        "strict"    : true,
        "white"     : false,
        "indent"    : 2
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      all: {
        files: {
          'annyang.min.js': ['annyang.js'],
          'sites/facebook.min.js': ['annyang.js', 'sites/facebook.js']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

};
