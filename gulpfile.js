'use strict'; /* jshint ignore:line */
var gulp = require('gulp')
  , $ = require('gulp-load-plugins')() /* jshint ignore:line */
  , pug  = require('gulp-pug')
  , sourcemaps 	= require('gulp-sourcemaps')
  , sass  = require('gulp-sass')
  , stylus = require('gulp-stylus')
  , connect 		= require('gulp-connect')
  , spritesmith = require('gulp.spritesmith')
  , path = require('path')
  , fs = require('fs')
  , del = require('del')
  , browserSync = require('browser-sync')
  , iconfont = require('gulp-iconfont')
  , iconfontCSS = require('gulp-css-iconfont')
  , pkg = JSON.parse(fs.readFileSync('package.json'))
  , version = parseInt(pkg.version)
  , store = pkg.store
  , acronym = pkg.acronym
  , env = pkg.environment
  , runSequence = require('run-sequence')


  /**
   * 3rd party vtex connect
   */

  , httpPlease = require('connect-http-please')
  , serveStatic = require('serve-static')
  , proxy = require('proxy-middleware')
  , url = require('url');


 /**
   * config
   */

var accountName = store
  , environment = env
  , portalHost = accountName +'.'+ environment + '.com.br'
  , imgProxyOptions = url.parse('http://' + accountName + '/arquivos')
  , portalProxyOptions = url.parse('http://' + portalHost + '/')
  , bannerFiles = '/**\n' +
                  ' * I2B <i2btech.com>\n' +
                  ' * '+ accountName + '\n' +
                  ' * @date <%= new Date() %>\n' +
                  ' */\n\n';

// imgProxyOptions.route = '/arquivos';
portalProxyOptions.preserveHost = true;

var CONST = {
	ROOT : 'build/'
};
var server_port = 8080;
 /**
   * connect
   */
  gulp.task('connect', function(){
    connect.server({
      root: CONST.ROOT,
      port: server_port,
      livereload: true
    });
  });
// gulp.task('connect', function () {
//   $.connect.server({
//     host: 'localhost',
//     port: 80,
//     debug: false,
//     middleware: function() {
//       return [
//         /**
//          * disableCompression
//          */
//         function disableCompression (req, res, next) {
//           req.headers['accept-encoding'] = 'identity';
//           return next();
//         },

//         /**
//          * replaceHtmlBody
//          */
//         function (req, res, next) {
//           var ignoreReplace = [/\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/, /\.woff(\?.*)?$/, /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/];

//           var ignore = ignoreReplace.some(function (ignore) {
//             return ignore.test(req.url);
//           });

//           if (ignore) {
//             return next();
//           }

//           var data = '';
//           var write = res.write;
//           var end = res.end;
//           var writeHead = res.writeHead;
//           var proxiedStatusCode = null;
//           var proxiedHeaders = null;

//           res.writeHead = function (statusCode, headers) {
//             proxiedStatusCode = statusCode;
//             proxiedHeaders = headers;
//           };

//           res.write = function (chunk) {
//             return data += chunk;
//           }

//           res.end = function (chunk, encoding) {
//             if (chunk) {
//               data += chunk;
//             }

//             if (data) {
//               data = data.replace(new RegExp(environment, 'g'), 'vtexlocal');
//               data = data.replace(new RegExp('vteximg', 'g'), 'vtexlocal');
//             }

//             res.write = write;
//             res.end = end;
//             res.writeHead = writeHead;

//             if (proxiedHeaders !== null) {
//               proxiedHeaders['content-length'] = Buffer.byteLength(data);
//               res.writeHead(proxiedStatusCode, proxiedHeaders);
//             }

//             return res.end(data, encoding);
//           }

//           return next();
//         },

//         /**
//          * httpPlease
//          */
//         httpPlease({
//           host: portalHost
//         }),

//         /**
//          * serveStatic
//          */
//         serveStatic('build/'),

//         /**
//          * Proxy
//          */
//         proxy(imgProxyOptions),
//         proxy(portalProxyOptions),

//         function (err, req, res, next) {
//           console.log(err);
//         }
//       ]
//     },
//     livereload: true
//   });

//   var openOptions = {
//     uri: 'http://'+ store +'.vtexlocal.com.br/'
//   };

//   return gulp.src('./')
//     .pipe($.open(openOptions));
// });

/**
 * Cargar server
 */

gulp.task('browser-sync', function() {
  browserSync({
      server: {
          baseDir: 'build'
      }
  });
});

gulp.task('reload-browser', function () {
  browserSync.reload();
});


/**
 * clean
 */

gulp.task('clean', function () {
  return del(['build/', 'deploy/']);
});


/**
 * javascript
 */

gulp.task('js', ['js:main','js:libs']);

gulp.task('js:main', function () {
  var files = [
                'source/js/app.modules/*.js',
                'source/js/app.pages/*.js',
                'source/js/app.services/*.js'
              ]
  return gulp.src(files)
  // .pipe($.sourcemaps.init())
  .pipe($.concat('app.main.js'))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('build/files/'))
  .pipe($.connect.reload())
  .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js:libs', function () {
  return gulp.src(['source/js/app.libraries/*'])
    .pipe(gulp.dest('build/files/'))
    .pipe($.connect.reload())
    .pipe(browserSync.reload({ stream: true }))
});



/**
 * js deploy
 */

gulp.task('js:deploy', function () {
  return gulp.src('build/files/*.js')
    .pipe($.stripComments())
    .pipe($.uglify())
    .pipe($.header(bannerFiles))
    .pipe(gulp.dest('deploy/js/'));
});


/**
 * styles
 */

gulp.task('styl', function () {
  return gulp.src('source/styl/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/files/'));
});


gulp.task('css', function () {
  return gulp.src('source/css/*.css')
    .pipe(gulp.dest('build/arquivos/'))
    .pipe($.connect.reload())
    browserSync.reload();
});


/**
 * Icon fonts
 */

gulp.task('iconfont', function() {
  gulp.src(['source/img/svg/*.svg'])
    .pipe(iconfontCSS({
      fontName: 'icon',
      targetPath: '../styl/config/icons.styl',
      fontPath: '/arquivos/'
    }))
    .pipe(iconfont({
      fontName: 'icon',
      // Remove woff2 if you get an ext error on compile
      formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
      normalize: true,
      fontHeight: 1001
    }))
    .pipe(gulp.dest('source/fonts/'))
});

/**
 *  sprite
 */

gulp.task('sprite', function() {
  var spriteData = gulp.src('source/img/sprite/*.png')
  .pipe($.spritesmith({
		imgName: 'sprite.png',
		cssName: '_sprite.styl',
		imgPath: '../img/sprite.png'
	}));

	spriteData.img
		.pipe(gulp.dest('source/img/'))
		.pipe(browserSync.reload({ stream: true }));

	spriteData.css
		.pipe(gulp.dest('source/styl/config/'))
		.pipe(browserSync.reload({ stream: true }));
});



/**
 * Copy font
 */

gulp.task('copy-fonts', function() {
  return gulp.src('source/fonts/*.*')
    .pipe(gulp.dest('build/arquivos/'));
});


/**
 * pug
 */

gulp.task('pug', function () {
  return gulp.src('source/html/*.pug')
  .pipe(pug({
    pretty: true,
    includePaths: ['source/html/'],
    onError: browserSync.notify
    // Your options in here.
  }))
  .pipe(gulp.dest('build/'))
  browserSync.reload();
});


/**
 * style deploy
 */

gulp.task('sass:deploy', function () {
  return gulp.src('build/arquivos/*.css')
    .pipe($.cssmin())
    .on('error', function (error) {
      console.log(error);
      this.emit('end');
    })
    .pipe($.header(bannerFiles))
    .pipe(gulp.dest('deploy/css/'));
});


/**
 * img
 */

gulp.task('img', function () {
  return gulp.src('source/img/*.{jpg,png,gif}')
    .pipe(gulp.dest('build/arquivos/'))
    .pipe($.connect.reload())
    .pipe(browserSync.reload({ stream: true }))
});


/**
 * img deploy
 */

gulp.task('img:deploy', function () {
  return gulp.src('build/arquivos/*.{png,jpg,gif}')
    // .pipe($.imageOptimization({
    //   optimizationLevel: 7,
    //   progressive: true,
    //   interlaced: true
    // }))
    .pipe(gulp.dest('deploy/img/'));
});


/**
 * watch
 */

gulp.task('watch', function () {
  gulp.watch(['source/css/*.css'], ['css']);
  gulp.watch(['source/styl/**/*.styl', 'source/img/sprite/*.png'], ['styl']);
  gulp.watch(['source/js/**/*.js', 'vendor.json'], ['js']);
  gulp.watch(['source/img/*.{jpg,png,gif}'], ['img']);
  gulp.watch(['source/html/**/*.pug'], ['pug']);
  gulp.watch(['build/**/*'], ['reload-browser']);

});


/**
 * build
 */

gulp.task('build', ['js', 'iconfont','copy-fonts', 'copy-fonts', 'styl', 'css', 'img', 'pug']);


/**
 * deploy
 */

gulp.task('deploy', function (cb) {
  return runSequence('clean', 'build', ['js:deploy','sass:deploy', 'img:deploy'], cb);
});

/**
 * server
 */
gulp.task('server', function (cb) {
  return runSequence('clean', ['browser-sync', 'build', 'watch'], cb);
});

/**
 * default
 */

gulp.task('default', function (cb) {
  return runSequence('clean', ['connect', 'build', 'watch'], cb);
});
