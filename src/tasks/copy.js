const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const templateFiles = require("./template-files");

const $ = gulpLoadPlugins();

module.exports = {
    label: "Copy Files",
    isAllowed(cfg) {
        return cfg.copy_files_src && cfg.copy_files_dist;
    },
    fn: (isDev) => (cfg) =>
        gulp
            .src(cfg.copy_files_src, cfg.copy_files_src_opts)
            .pipe(
                $.plumber({
                    errorHandler: plumberErrorHandler,
                    inherit: isDev,
                })
            )
            .pipe($.if(isDev, $.changed(cfg.copy_files_dist)))

            // Replate patterns.
            .pipe(templateFiles.replacePatternsPipe(cfg))

            // Dest.
            .pipe(gulp.dest(cfg.copy_files_dist)),
};
