const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const templateFiles = require("./template-files");
const gulpHelpers = require("../gulp-helpers");

const $ = gulpLoadPlugins();

module.exports = {
    label: "Copy Remote Files",
    isAllowed(cfg, isDev) {
        return (
            !isDev && cfg.remote_copy_files_src && cfg.remote_copy_files_dist
        );
    },
    fn: (isDev) => (cfg) =>
        $.remoteSrc(cfg.remote_copy_files_src, cfg.remote_copy_files_src_opts)
            .pipe(
                $.plumber({
                    errorHandler: plumberErrorHandler,
                    inherit: isDev,
                })
            )
            .pipe($.if(isDev, $.changed(cfg.remote_copy_files_dist)))

            // Replate patterns.
            .pipe(templateFiles.replacePatternsPipe(cfg, "remote-copy"))

            .pipe(gulpHelpers.count("Copied remote"))

            .pipe(gulp.dest(cfg.remote_copy_files_dist)),
};
