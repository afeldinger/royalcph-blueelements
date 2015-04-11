module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      options: {
          livereload: true,
      },
      scripts: {
        files: ['src/assets/js/**/*.js'],
        tasks: ['jshint'],
        options: {
            spawn: false,
        },
      },
      images: {
        files: ['src/assets/img/**/*.{png,jpg,gif}'],
        tasks: ['imagemin'],
        options: {
          spawn: false,
        }
      },

      sprites: {
        files: ['src/assets/img/{sprites,sprites-2x}/*.png'],
        tasks: ['sprite'],
      },

      iconfonts: {
        files: ['src/assets/fonts/icons/*.svg'],
        tasks: ['font'],
      },

      styles: {
        files: ['src/assets/sass/**/*.scss'],
        tasks: ['compass:dev', 'autoprefixer:dev'],
        options: {
            spawn: false,
        }
      },

      handlebars: {
        files: ['src/templates/layouts/*.hbs', 'src/templates/partials/**/*.hbs', 'src/templates/pages/*.hbs', 'src/templates/data/*.json'],
        tasks: ['assemble'],
      },
    },


    font: {
      all: {
        // SVG files to read in 
        src: ['src/assets/fonts/icons/*.svg'],
   
        // Location to output CSS variables 
        destCss: [
          //'src/assets/css/icons.css',
          'src/assets/sass/base/_iconfont.scss'
        ],
   
        // Location to output fonts (expanded via brace expansion) 
        destFonts: 'src/assets/fonts/icons.{svg,woff,eot,ttf}',
   
        // Optional: Custom naming of font families for multi-task support 
        fontFamily: 'icons',


        cssRouter: function (fontpath) {
          return fontpath.replace('src/assets','..');

        },
      }
    },

    // Assembles your page content with html layout
    assemble: {
      options: {
        layoutdir: 'src/templates/layouts',
        layout: 'section.hbs',
        partials: ['src/templates/partials/**/*.hbs'],
        assets: './src/assets',
        helpers: [
          'handlebars-helpers',
          'helper-aggregate',
          'handlebars-helper-partial',
          'handlebars-helper-autolink',
          'handlebars-helper-isactive',
          './src/templates/helpers/**/*.js',
        ],
        
        collections: [
          {
            title: 'pages',
            sortby: 'sortorder',
            sortorder: 'asc', 
          }
        ],
        snaps: grunt.file.readJSON('src/templates/data/snaps.json'),
        products: grunt.file.readJSON('src/templates/data/products.json'),
        /*
        articles: grunt.file.readJSON('src/templates/data/articles.json'),
        sections: grunt.file.readJSON('src/templates/data/sections.json'),
        */
        //flatten: true,
        marked: {
          gfm: false,
        }
      },

      pages: {
        files: [{
          cwd: './src/templates/pages/',
          dest: 'dist/',
          expand: true,
          src: '**/*.hbs',
        }]
      },

    },

    htmlmin: {
      dist: {
        options: {
          removeComments: false,
          collapseWhitespace: false,
          preserveLineBreaks: true,
        },
        files: [{
            expand: true,
            cwd: 'dist/',
            src: '**/*.html',
            dest: 'dist/'
        }]
      },
    },

    prettify: {
      dist: {
        options: {
          indent: 2,
          condense: true,
          indent_inner_html: true,
          preserve_newlines: true,
          max_preserve_newlines: 1,
          unformatted: [
            "a",
            "pre",
            "code"
          ]
        },
        files: [{
            expand: true,
            cwd: 'dist/',
            src: '**/*.html',
            dest: 'dist/'
        }]
      }
    },


    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['src/assets/js/{,**/}*.js', '!src/assets/js/libs/**/*.js']
    },

    concat: { 
      js: {
          src: [
              'src/assets/js/libs/*.js', // All JS in the libs folder
              'src/assets/js/*.js',  // Custom JS files
              '!src/assets/js/libs/modernizr.min.js'
          ],
          dest: 'dist/assets/js/scripts.js',
      },
    },

    uglify: {
      js: {
          src: 'dist/assets/js/scripts.js',
          dest: 'dist/assets/js/scripts.min.js',
      },
    },

    sprite:{
      retina: {
        src: 'src/assets/img/sprites-2x/*.png',
        dest: 'src/assets/img/sprites-2x.png',
        destCss: 'src/assets/sass/abstractions/_sprites-2x.scss',
        imgPath: '../img/sprites-2x.png',
        cssVarMap: function (sprite) {
          sprite.name = 'sprite_' + sprite.name + '_2x';
        },
      },
      normal: {
        src: 'src/assets/img/sprites/*.png',
        dest: 'src/assets/img/sprites.png',
        destCss: 'src/assets/sass/abstractions/_sprites.scss',
        imgPath: '../img/sprites.png',
        cssVarMap: function (sprite) {
          sprite.name = 'sprite_' + sprite.name;
        }
      },

    },

    imagemin: {
        dist: {
            files: [{
                expand: true,
                cwd: 'src/assets/img/',
                src: ['**/*.{png,jpg,gif}'],
                dest: 'dist/assets/img/'
            }]
        }
    },

    svgmin: {
        options: {
            plugins: [
                {
                    removeViewBox: false
                }, {
                    removeUselessStrokeAndFill: false
                }
            ]
        },
        dist: {
            files: [{
                expand: true,
                cwd: 'src/assets/img/',
                src: ['**/*.svg'],
                dest: 'dist/assets/img/'
            }]
        }
    },

    compass: {
      options: {
        config: 'config.rb',
        bundleExec: true,
        force: true
      },
      dev: {
        options: {
          environment: 'development'
        }
      },
      dist: {
        options: {
          environment: 'production'
        }
      }
    },



    autoprefixer: {
      /*
        options: {
          browsers: ['last 2 versions', 'ie>=9']
        },
      */
        dev: {
            files: {
                'src/assets/css/default.css': 'src/assets/css/default.css',
            },
        },
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/assets/css',
          src: ['*.css', '!*.min.css'],
          dest: 'dist/assets/css',
          ext: '.min.css',
        }]
      },
    },
    
    clean: {
      dist: {
        src: ['dist/*', '!dist/.htaccess'],
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true, 
            cwd: 'src/assets/fonts/', 
            src: ['*.{svg,woff,eot,ttf}'],
            dest: 'dist/assets/fonts/',
          },
          {
            expand: true,
            cwd: 'src/assets/js/',
            src: [
              'main.js',
              'libs/modernizr.min.js'
            ],
            dest: 'dist/assets/js/',
          },
          {
            expand: true,
            cwd: 'src/assets/favicons/',
            src: ['*'],
            dest: 'dist/',
          }
        ],
      },

    },

    useminPrepare: {
      html: 'dist/01-frontpage.html',
      options: {
          dest: 'dist/'
      }
    },

    usemin: {
      html: 'dist/**/*.html',
    },


    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /(\.\.\/src\/assets\/|src\/assets\/|assets\/)/g,
              replacement: 'http://git.krympevaerk.dk/royalcph/blueelements/dist/assets/',
            },
          ]
        },
        files: [
          {
            expand: true, 
            //flatten: true, 
            cwd: 'dist',
            src: ['**/*.{html,css}'],
            dest: 'dist/.'
          }
        ]
      },
    },


  });

  // Load plugins
  require('matchdep').filterDev(['grunt-*', 'assemble']).forEach(grunt.loadNpmTasks);

  // Default task(s).
  grunt.registerTask('default', ['assemble', 'compass:dist', 'autoprefixer']);

  // Build minified assets
  grunt.registerTask('build', [
    'clean:dist',
    'default',
    'htmlmin', 
    'prettify', 
    'imagemin',
    'svgmin',
    'concat',
    'cssmin',
    'uglify',
    'useminPrepare', 
    'usemin',
    'copy:dist',
    'replace:dist',

  ]);

};