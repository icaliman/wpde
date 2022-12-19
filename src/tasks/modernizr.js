const gulp = require("gulp");
const webpack = require("webpack");
const $webpack = require("webpack-stream");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const webpackconfig = require("../../webpack.config");
const templateFiles = require("./template-files");
const gulpHelpers = require("../gulp-helpers");

const $ = gulpLoadPlugins();

module.exports = {
    label: "Modernizr Build",
    isAllowed(cfg) {
        return cfg.modernizr_files_src && cfg.modernizr_files_dist;
    },
    fn: (isDev) => (cfg) => {
        return (
            gulp
                .src(cfg.modernizr_files_src, cfg.modernizr_files_src_opts)
                .pipe(
                    $.plumber({
                        errorHandler: plumberErrorHandler,
                        inherit: isDev,
                    })
                )

                // Replate patterns.
                .pipe(modernizr(cfg.modernizr_opts))

                // Dest
                .pipe(gulp.dest(cfg.modernizr_files_dist))
        );
    },
};
