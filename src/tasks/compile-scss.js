const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");

// Use Dart Sass https://sass-lang.com/dart-sass.
const sass = require("gulp-sass")(require("sass"));
const gulpLoadPlugins = require("gulp-load-plugins");

const plumberErrorHandler = require("../plumber-error-handler");
const generateCSSComments = require("../generate-css-comments");
const templateFiles = require("./template-files");

const $ = gulpLoadPlugins();

module.exports = {
    label: "SCSS Compiler",
    isAllowed(cfg) {
        return cfg.compile_scss_files_src && cfg.compile_scss_files_dist;
    },
    fn: (isDev) => (cfg) => {
        let postcssPlugins = [autoprefixer()];

        if (cfg.tailwindConfig) {
            postcssPlugins.push(tailwindcss(cfg.tailwindConfig));
        }

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
                        outputStyle: cfg.compile_scss_files_compress
                            ? "compressed"
                            : "expanded",
                        includePaths: cfg.compile_scss_include_paths,
                    }).on("error", sass.logError)
                )

                // Autoprefixer
                .pipe($.postcss(postcssPlugins))

                // Add TOC Comments
                .pipe($.change(generateCSSComments))

                // Rename
                .pipe(
                    $.if(
                        cfg.compile_scss_files_compress,
                        $.rename({
                            suffix: ".min",
                        })
                    )
                )

                // Sourcemaps
                .pipe($.if(isDev, $.sourcemaps.write()))

                // Replate patterns.
                .pipe(templateFiles.replacePatternsPipe(cfg, "compile-scss"))

                // Dest
                .pipe(gulp.dest(cfg.compile_scss_files_dist))

                // Browser Sync
                .pipe(cfg.bs ? cfg.bs.stream() : $.noop())
        );
    },
};
