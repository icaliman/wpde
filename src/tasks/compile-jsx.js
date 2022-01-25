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
    label: "JSX Compiler",
    isAllowed(cfg) {
        return cfg.compile_jsx_files_src && cfg.compile_jsx_files_dist;
    },
    fn: (isDev) => (cfg) =>
        gulp
            .src(cfg.compile_jsx_files_src, cfg.compile_jsx_files_src_opts)
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

            // Rename.
            .pipe(
                $.if(
                    cfg.compile_jsx_files_compress,
                    $.rename({
                        suffix: ".min",
                    })
                )
            )

            // Replate patterns.
            .pipe(templateFiles.replacePatternsPipe(cfg, "compile-jsx"))

            // Dest
            .pipe(gulp.dest(cfg.compile_jsx_files_dist)),
};
