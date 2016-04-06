module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
      // make a zipfile
    compress: {
      main: {
        options: {
          archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip',
          mode: 'zip',
        },
      files: [
          { expand: true, src : "**/*", cwd : "src/" },
          { src : "package.json"},
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', ['compress']);

};