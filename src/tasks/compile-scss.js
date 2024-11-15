const gulp = require("gulp");
const cleanCSS = require("gulp-clean-css");

// Use Dart Sass https://sass-lang.com/dart-sass.
const sass = require("gulp-sass")(require("sass"));
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const generateCSSComments = require("../generate-css-comments");
const templateFiles = require("./template-files");
const gulpHelpers = require("../gulp-helpers");

const $ = gulpLoadPlugins();

module.exports = {
    label: "SCSS Compiler",
    isAllowed(cfg) {
        return cfg.compile_scss_files_src && cfg.compile_scss_files_dist;
    },
    fn: (isDev) => (cfg) => {
        let compress = !isDev && cfg.compile_scss_files_compress;

        return (
            gulp
                .src(
                    cfg.compile_scss_files_src,
                    cfg.compile_scss_files_src_opts
                )
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
                        $rtl: false,
                    })
                )
                .pipe(
                    sass({
                        outputStyle: cfg.compile_scss_output_style,
                        includePaths: cfg.compile_scss_include_paths,
                    }).on("error", sass.logError)
                )

                // Autoprefixer
                .pipe($.postcss(cfg.postcss_config))

                // Add TOC Comments
                .pipe($.change(generateCSSComments))

                // Sourcemaps
                .pipe($.if(isDev, $.sourcemaps.write()))

                // Replate patterns.
                .pipe(templateFiles.replacePatternsPipe(cfg, "compile-scss"))

                .pipe(gulpHelpers.count("Compiled SCSS"))

                // Dest
                .pipe(gulp.dest(cfg.compile_scss_files_dist))

                // Browser Sync
                .pipe(cfg.bs ? cfg.bs.stream() : $.noop())

                // Compress files
                .pipe(
                    $.if(
                        compress,
                        $.rename({
                            suffix: ".min",
                        })
                    )
                )
                .pipe($.if(compress, cleanCSS()))
                .pipe($.if(compress, gulp.dest(cfg.compile_scss_files_dist)))
        );
    },
};
