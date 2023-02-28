const gulp = require("gulp");
const webpack = require("webpack");
const $webpack = require("webpack-stream");
const gulpLoadPlugins = require("gulp-load-plugins");
const uglify = require("gulp-uglify");

const plumberErrorHandler = require("../plumber-error-handler");
const webpackconfig = require("../../webpack.config");
const templateFiles = require("./template-files");
const gulpHelpers = require("../gulp-helpers");

const $ = gulpLoadPlugins();

module.exports = {
    label: "JS Compiler",
    isAllowed(cfg) {
        return cfg.compile_js_files_src && cfg.compile_js_files_dist;
    },
    fn: (isDev) => (cfg) => {
        let compress = !isDev && cfg.compile_js_files_compress;

        return (
            gulp
                .src(cfg.compile_js_files_src, cfg.compile_js_files_src_opts)
                .pipe(
                    $.plumber({
                        errorHandler: plumberErrorHandler,
                        inherit: isDev,
                    })
                )

                // Add cfg.name prefix to prevent issues with multiple configs
                .pipe(gulpHelpers.namedWithPrefix(cfg.name))

                // Webpack.
                .pipe($webpack(webpackconfig(isDev), webpack))

                .pipe(gulpHelpers.namedRemovePrefix(cfg.name))

                // Replate patterns.
                .pipe(templateFiles.replacePatternsPipe(cfg, "compile-js"))

                .pipe(gulpHelpers.count("Compiled JS"))

                // .pipe(gulpHelpers.esbuild(cfg.compile_js_files_dist))

                // Dest
                .pipe(gulp.dest(cfg.compile_js_files_dist))

                // Rename and minify.
                .pipe(
                    $.if(
                        compress,
                        $.rename({
                            suffix: ".min",
                        })
                    )
                )
                .pipe($.if(compress, uglify()))
                .pipe($.if(compress, gulp.dest(cfg.compile_js_files_dist)))
        );
    },
};
