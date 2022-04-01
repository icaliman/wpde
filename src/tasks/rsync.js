const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");

const $ = gulpLoadPlugins();

module.exports = {
    label: "Rsync Copy Files",
    isAllowed(cfg) {
        return cfg.rsync_copy_files && cfg.rsync_copy_files.length;
    },
    fn: (isDev) => (cfg, done) => {
        const rsyncTasks = cfg.rsync_copy_files.map((rsyncData) => () => {
            return gulp.src(rsyncData.src).pipe(
                $.rsync({
                    ...rsyncData,
                    src: null,
                })
            );
        });

        return gulp.series(...rsyncTasks)(done);
    },
};
