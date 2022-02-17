const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const rtlcss = require("rtlcss");

// Use Dart Sass https://sass-lang.com/dart-sass.
const sass = require("gulp-sass")(require("sass"));

const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const generateCSSComments = require("../generate-css-comments");
const templateFiles = require("./template-files");

const $ = gulpLoadPlugins();

module.exports = {
    label: "SCSS RTL Compiler",
    isAllowed(cfg) {
        return (
            cfg.compile_scss_files_rtl &&
            cfg.compile_scss_files_src &&
            cfg.compile_scss_files_dist
        );
    },
    fn: (isDev) => (cfg) =>
        gulp
            .src(cfg.compile_scss_files_src, cfg.compile_scss_files_src_opts)
            .pipe(
                $.plumber({
                    errorHandler: plumberErrorHandler,
                    inherit: isDev,
                })
            )

            // Sourcemaps Init
            .pipe($.if(isDev, $.sourcemaps.init()))

            // SCSS
            .pipe(
                $.sassVariables({
                    $rtl: true,
                })
            )
            .pipe(
                sass({
                    outputStyle: cfg.compile_scss_files_compress
                        ? "compressed"
                        : "expanded",
                    includePaths: cfg.compile_scss_include_paths,
                }).on("error", sass.logError)
            )

            .pipe(
                $.postcss([
                    // Autoprefixer
                    autoprefixer(),

                    // RTL
                    rtlcss(),
                ])
            )

            // Add TOC Comments
            .pipe($.change(generateCSSComments))

            // Rename
            .pipe(
                $.if(
                    !cfg.compile_scss_files_compress,
                    $.rename({
                        suffix: "-rtl",
                    })
                )
            )
            .pipe(
                $.if(
                    cfg.compile_scss_files_compress,
                    $.rename({
                        suffix: "-rtl.min",
                    })
                )
            )

            // Sourcemaps
            .pipe($.if(isDev, $.sourcemaps.write()))

            // Replate patterns.
            .pipe(templateFiles.replacePatternsPipe(cfg, "compile-scss-rtl"))

            // Dest
            .pipe(gulp.dest(cfg.compile_scss_files_dist))

            // Browser Sync
            .pipe(cfg.bs ? cfg.bs.stream() : $.noop()),
};
