module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      dist: {
        src: ['js/conf/config.js', 'js/app.js', 'js/utils/*.js', 'js/collections/*.js', 'js/services/*.js', 
        'js/filters/*.js', 'js/controllers/*.js', 'js/directives/*.js'],
        dest: 'js/dist/app.concatenated.js',
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'js/app.js',
        dest: 'js/dist/app.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "concat" task
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  //grunt.registerTask('default', ['uglify']);
  
};