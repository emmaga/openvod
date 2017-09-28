var gulp = require('gulp');
var plumber = require('gulp-plumber'); // less编译出错时继续执行

// less 插件
// var less = require('gulp-less');

// 自动同步浏览器插件
var browserSync = require('browser-sync');

// 压缩js插件
var uglify = require('gulp-uglify');

// 压缩css插件
var minifyCss = require('gulp-minify-css');

//- 多个文件合并为一个；
var concat = require('gulp-concat');

// 删除文件插件
var del = require('del');

// 同步运行任务插件
var runSequence = require('run-sequence');

// 给css3属性添加浏览器前缀插件
var autoprefixer = require('gulp-autoprefixer');

// 缓存插件，可以加快编译速度
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var jsFiles = [
    './plugins/laydate/laydate.js',
    './src/modules/controllers.js',
    './src/modules/tv-admin-controllers.js',
    './src/modules/project-config-controllers.js',
    './src/modules/member-card-controllers.js',
    './src/modules/orders-controllers.js',
    './src/modules/directives.js',
    './src/modules/services.js',
    './src/modules/filters.js',
    './src/modules/qcode-controller.js',
    './src/modules/report-controller.js',
    './src/modules/ticket-controller.js',
    './src/modules/advance-goods-controller.js',
    './plugins/angular-locale_zh-cn.js',
    './plugins/ramda.min.js'
];

var cssFiles = [
    './src/style/app.css',
    './src/style/ionic.parts.css'
];

// 编译less文件，添加css3属性浏览器前缀，reload 浏览器
// gulp.task('less', function() {
//     return gulp.src('./src/less/**/*.less')
//         .pipe(plumber())
//         .pipe(less())
//         .pipe(autoprefixer())
//         .pipe(gulp.dest('./src/css'))
//         .pipe(browserSync.reload({ stream: true }));
// });


gulp.task('uglifyJS', function () {
    return gulp.src(jsFiles)
        .pipe(plumber())
        .pipe(cached('js-task'))
        .pipe(uglify())
        .pipe(remember('js-task'))
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('css', function () {
    return gulp.src(cssFiles)
        .pipe(concat('app.min.css'))
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(gulp.dest('./dist/style'))
        .pipe(browserSync.reload({stream: true}));
})

// 自动更新浏览器任务
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: './'
        }
    })
});

// 清除缓存
gulp.task('cache:clear', function (cb) {
    return cache.clearAll(cb)
});

// 监控任务，当有less文件，html文件，js文件改动的时候，刷新浏览器
gulp.task('watch', ['browserSync', 'css', 'uglifyJS'], function () {
    gulp.watch('./src/style/**/*.css', ['css']);
    gulp.watch('./pages/**/*.html', browserSync.reload);
    gulp.watch('./src/**/*.js', ['uglifyJS']);
});


// gulp 默认执行任务
gulp.task('default', function (callback) {
    runSequence(['uglifyJS', 'css', 'browserSync', 'watch'], callback);
});