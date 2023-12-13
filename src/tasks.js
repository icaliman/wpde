const gulp = require("gulp");
const Spinnies = require("spinnies");
const chalk = require("chalk");
const prettyHrtime = require("pretty-hrtime");
const browserSync = require("browser-sync");
const chokidar = require("chokidar");

// Internal data.
const allTasks = require("./tasks/index");
const { getConfig } = require("./config");
const { time } = require("./notices");

const currentLogs = {};
const spinnies = new Spinnies({ color: "white", succeedColor: "white" });

function endTask(name) {
    if (currentLogs[name]) {
        spinnies.succeed(name, {
            text: [
                time(),
                " ",
                chalk.blue(
                    (allTasks[name] && allTasks[name].label) || name || ""
                ),
                " after ",
                chalk.red(prettyHrtime(process.hrtime(currentLogs[name]))),
            ].join(""),
        });
        delete currentLogs[name];
    }
}
function startTask(name) {
    // Already running
    if (currentLogs[name]) {
        endTask(name);
    }

    // Create new log
    spinnies.add(name, {
        text: [
            time(),
            " ",
            chalk.blue((allTasks[name] && allTasks[name].label) || name || ""),
        ].join(""),
    });
    currentLogs[name] = process.hrtime();
}

function watchFiles(files, options, cb) {
    let watcher = chokidar.watch(files, options);

    watcher.on("raw", (evt, filePath, meta) => {
        cb();
    });
}

module.exports = function (tasks = [], config) {
    // Is development.
    const isDev = global.cli.flags.dev || global.cli.flags.watch;

    const configs = getConfig(config, isDev);

    // run streams for each of items (theme and plugins)
    function runStream(name, func, isParallel = false) {
        return (done) => {
            const dynamicTasks = [];

            configs.forEach((cfg) => {
                if (
                    !name ||
                    !allTasks[name] ||
                    allTasks[name].isAllowed(cfg, isDev)
                ) {
                    dynamicTasks.push((cb) => func(cfg, cb));
                }
            });

            if (dynamicTasks.length) {
                gulp.series(
                    (cb) => {
                        if (name) {
                            startTask(name);
                        }
                        cb();
                    },
                    gulp[isParallel ? "parallel" : "series"](...dynamicTasks),
                    (cb) => {
                        if (name) {
                            endTask(name);
                        }
                        cb();
                    }
                )(done);
            } else {
                done();
            }
        };
    }

    // clean dist folder.
    gulp.task("clean", runStream("clean", allTasks.clean.fn(isDev)));

    // copy to dist.
    gulp.task("copy", runStream("copy", allTasks.copy.fn(isDev)));

    // remote copy to dist.
    gulp.task(
        "remote_copy",
        runStream("remote_copy", allTasks.remote_copy.fn(isDev))
    );

    // prefix scss files.
    gulp.task(
        "prefix_scss",
        runStream("prefix_scss", allTasks.prefix_scss.fn(isDev))
    );

    // compile scss.
    gulp.task(
        "compile_scss",
        runStream("compile_scss", allTasks.compile_scss.fn(isDev))
    );

    // compile scss rtl.
    gulp.task(
        "compile_scss_rtl",
        runStream("compile_scss_rtl", allTasks.compile_scss_rtl.fn(isDev))
    );

    // compile js.
    gulp.task(
        "compile_js",
        runStream("compile_js", allTasks.compile_js.fn(isDev))
    );

    // compile jsx.
    gulp.task(
        "compile_jsx",
        runStream("compile_jsx", allTasks.compile_jsx.fn(isDev))
    );

    // create modernizr.
    gulp.task(
        "modernizr",
        runStream("modernizr", allTasks.modernizr.fn(isDev))
    );

    // template files.
    gulp.task(
        "template_files",
        runStream("template_files", allTasks.template_files.fn(isDev))
    );

    // correct line endings.
    gulp.task(
        "correct_line_endings",
        runStream(
            "correct_line_endings",
            allTasks.correct_line_endings.fn(isDev)
        )
    );

    // translate PHP.
    gulp.task(
        "translate_php",
        runStream("translate_php", allTasks.translate_php.fn(isDev))
    );

    // ZIP task.
    gulp.task("zip", runStream("zip", allTasks.zip.fn(isDev)));

    // Rsync task.
    gulp.task(
        "rsync",
        global.cli.flags.rsync
            ? runStream("rsync", allTasks.rsync.fn(isDev))
            : (cb) => cb()
    );

    // build task.
    gulp.task(
        "build",
        gulp.series(
            (cb) => {
                startTask("Build");
                cb();
            },
            "clean",
            gulp.parallel("copy", "remote_copy"),
            gulp.parallel("compile_scss", "compile_scss_rtl"),
            gulp.parallel("compile_js", "compile_jsx"),
            "prefix_scss",
            "modernizr",
            "template_files",
            "correct_line_endings",
            "translate_php",
            (cb) => {
                endTask("Build");
                cb();
            }
        )
    );

    let bsInited = false;

    // Browser Sync Init task.
    gulp.task(
        "bs_init",
        runStream("", (cfg, cb) => {
            if (cfg.browser_sync) {
                cfg.bs = browserSync.create(cfg.name);
                cfg.bs.init(cfg.browser_sync);
            }

            cb();
        })
    );

    // Browser Sync Reload task.
    gulp.task(
        "bs_reload",
        runStream("", (cfg, cb) => {
            if (cfg.bs) {
                cfg.bs.reload();
            }
            cb();
        })
    );

    // watch task.
    gulp.task(
        "watch",
        gulp.series("bs_init", () => {
            runStream("", (cfg, cb) => {
                if (cfg.watch_files) {
                    watchFiles(
                        cfg.watch_files,
                        cfg.watch_files_opts,
                        gulp.series(
                            "copy",
                            "template_files",
                            "correct_line_endings",
                            "prefix_scss",
                            "rsync",
                            "bs_reload"
                        )
                    );
                }

                if (cfg.watch_js_files) {
                    watchFiles(
                        cfg.watch_js_files,
                        cfg.watch_js_files_opts,
                        gulp.series(
                            "compile_js",
                            "modernizr",
                            "rsync",
                            "bs_reload"
                        )
                    );
                }

                if (cfg.watch_jsx_files) {
                    watchFiles(
                        cfg.watch_jsx_files,
                        cfg.watch_jsx_files_opts,
                        gulp.series(
                            "compile_jsx",
                            "modernizr",
                            "rsync",
                            "bs_reload"
                        )
                    );
                }

                if (cfg.watch_scss_files) {
                    watchFiles(
                        cfg.watch_scss_files,
                        cfg.watch_scss_files_opts,
                        gulp.series(
                            "compile_scss",
                            "modernizr",
                            "compile_scss_rtl",
                            "rsync"
                        )
                    );
                }

                cb();
            })();
        })
    );

    gulp.series(...tasks)();
};
