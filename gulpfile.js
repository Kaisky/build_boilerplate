const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmineBrowser = require('gulp-jasmine-browser');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');

gulp.task('default', ['styles', 'lint','copy-assets','routes','scripts','scripts-dist'], function() {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['lint','scripts-dist']);
  gulp.watch('src/index.html',['routes']);
  gulp.watch('src/assets/**/*',['copy-assets']);
  gulp.watch(['src/index.html','src/sass/**/*.scss','src/js/**/*.js'])
    .on('change', browserSync.reload);

  browserSync.init({
    server: './dist',
  });
});

gulp.task('dist', [
  'routes',
  'copy-assets',
  'styles',
  'lint',
  'scripts-dist'
]);

gulp.task('styles', function() {
  gulp
      .src('src/sass/**/*.scss')
      .pipe(sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError))
      .pipe(
          autoprefixer({
            browsers: ['last 2 versions'],
          })
      )
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.stream());
});

gulp.task('copy-assets', function() {
  gulp.src('src/assets/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('dist/assets'));
});

gulp.task('routes', function(){
  gulp.src('src/index.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
  gulp.src('src/js/**/*.js')
    .pipe(babel())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
})

gulp.task('scripts-dist', function() {
  gulp.src('src/js/**/*.js')
  .pipe(babel({
    presets: ['@babel/env']
}))
  .pipe(concat('main.js'))
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'))
})

gulp.task('lint', function() {
  return (
    gulp
        .src(['js/**/*.js'])
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
        .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError())
  );
});

gulp.task('tests', function() {
  return gulp
      .src('tests/spec/extraSpec.js')
      .pipe(jasmineBrowser.specRunner({console: true}))
      .pipe(jasmineBrowser.headless({driver: 'chrome'}));
});

// gulp.task('tests', function() {
//     gulp
//         .src('tests/spec/extraSpec.js')
//         .pipe(jasmineBrowser.specRunner())
//         .pipe(jasmineBrowser.server({ port: 3001 }));
// });
