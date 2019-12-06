module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        'Gruntfile.js',
        'src/annyang.js',
        'test/spec/*Spec.js'
      ],
      options: {
        jshintrc: true
      }
    },
    'babel': {
      options: {
        sourceMap: true,
        presets: ['env']
      },
      dist: {
        files: {
          'dist/annyang.js': 'src/annyang.js'
        }
      }
    },
    watch: {
      files: ['src/*.js', 'demo/css/*.css', 'test/spec/*Spec.js', '!**/node_modules/**'],
      tasks: ['default']
    },
    uglify: {
      options: {
        output: {
          comments: /^\! /
        }
      },
      all: {
        files: {
          'dist/annyang.min.js': ['dist/annyang.js']
        }
      }
    },
    imagemin: {
      demoimages: {                       // Target
        options: {                        // Target options
        },
        files: [{
          expand: true,                   // Enable dynamic expansion
          cwd: 'demo/images',             // Src matches are relative to this path
          src: ['*.{png,jpg,gif}'],       // Actual patterns to match
          dest: 'demo/images'             // Destination path prefix
        }]
      }
    },
    cssmin: {
      combine: {
        files: {
          'demo/css/main.min.css': ['demo/css/main.css', 'demo/vendor/css/default.css', 'demo/vendor/css/github.css']
        }
      }
    },
    markdox: {
      target: {
        files: [
          {src: 'src/annyang.js', dest: 'docs/README.md'}
        ]
      }
    },
    connect: {
      server: {
        options: {
          protocol: 'https',
          port: 8443,
          hostname: '*',
          base: '.',
          open: 'https://localhost:8443/demo'
        }
      }
    },
    jasmine: {
      browserAMD: {
        src: ['dist/annyang.min.js'],
        options: {
          specs: 'test/spec/*Spec.js',
          outfile: 'test/SpecRunner.html',
          vendor: ['test/vendor/corti.js', 'test/init_corti.js'],
          keepRunner: true,
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfig: {
              baseUrl: '../dist/'
            }
          }
        }
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
  });

  // Register tasks
  grunt.registerTask('default', ['jshint', 'babel', 'uglify', 'cssmin', 'markdox']);
  grunt.registerTask('dev', ['default', 'connect', 'watch']);
  grunt.registerTask('test', ['default', 'jasmine']);

};
