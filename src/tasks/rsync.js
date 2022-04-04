const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const gulpHelpers = require("../gulp-helpers");

const $ = gulpLoadPlugins();

module.exports = {
    label: "Rsync Copy Files",
    isAllowed(cfg) {
        return cfg.rsync_copy_files && cfg.rsync_copy_files.length;
    },
    fn: (isDev) => (cfg, done) => {
        const rsyncTasks = cfg.rsync_copy_files.map((rsyncData) => () => {
            return gulp
                .src(rsyncData.src)
                .pipe(gulpHelpers.touch())
                .pipe(
                    $.rsync({
                        ...rsyncData,
                        src: null,
                    })
                );
        });

        return gulp.series(...rsyncTasks)(done);
    },
};
