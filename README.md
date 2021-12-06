# WPDE - WordPress Development Environment

## Installation

```$ npm install wpde --save-dev```

## Prepare config

WPDE works only with config in your theme/plugin directory. Create file `wpde.config.js`.

```javascript
const pkg = require( 'json-file' ).read( './package.json' ).data;

const cfg = {};

// Build Paths.
cfg.name = 'plugin-name';
cfg.src = './src';
cfg.dist_root = './dist';
cfg.dist = '{dist_root}/{name}';

// Browser sync.
cfg.browser_sync = {
    proxy: '{name}.local',
};

// Template variables that will be automatically replaced.
// Search and replace all template variables like: @@text_domain, @@text_domain,
// @@icon:icon-file.svg|className:thfg-svg-icon|escape
cfg.template_files_src = '{dist}/**/*.{md,php,js,css,pot,json}';
cfg.template_files_variables = {
    text_domain: pkg.name,
    plugin_version: pkg.version,
    plugin_name: pkg.name,
    plugin_title: pkg.title,
    plugin_author: pkg.author,

    /**
     * Example how to replace template variable using a callback.
     *
     * @param {string} icon   Icon name containing @@icon: prefix, so it must be removed. Example: @@icon:icon-file.svg
     * @param {array} filters An array of filters. Example: [{name: 'className', args: ['thfg-svg-icon']}, ...]
     * @return {string|Promise} Content to pe pasted into files.
     */
    'icon:*': function (icon, filters) {
        icon = icon.replace('@@icon:', '');

        try {
            return fs.readFileSync(path.join('./src/assets/icons', icon));
        } catch (e) {
            console.error('Error while reading icon file', e.message);
            return icon;
        }
    },
};

// Path to icons included into templates
cfg.template_icons_path = '{src}/assets/icons';

// Clean files.
cfg.clean_files = '{dist}';
cfg.clean_files_opts = { force: true };

// Copy files.
cfg.copy_files_src = [
    '{src}/**/*',
    '!{src}/**/*.{js,jsx,scss}',
    '{src}/**/vendor/**/*.{js,jsx,scss}',
];

// Compile SCSS files.
cfg.compile_scss_files_src = [
    '{src}/**/*.scss',
    '!{src}/**/vendor/**/*',
];
cfg.compile_scss_files_src_opts = {};
cfg.compile_scss_output_style = 'compressed'; // nested | expanded | compact | compressed
cfg.compile_scss_include_paths = [ 'node_modules' ];


// Create additional CSS files with RTL support.
cfg.compile_scss_files_rtl = false;

// Compile JS files.
cfg.compile_js_files_src = [
    '{src}/**/*.js',
    '!{src}/**/vendor/**/*',
];

// Compile JSX files.
cfg.compile_jsx_files_src = [
    '{src}/*assets/js/index.jsx',
    '{src}/*assets/admin/js/blocks.jsx',
];

// Correct line endings files.
cfg.correct_line_endings_files_src = '{dist}/**/*.{js,css}';

// Translate PHP files.
cfg.translate_php_files_src = '{dist}/**/*.php';
cfg.translate_php_files_dist = `{dist}/languages/${ cfg.template_files_variables.plugin_name }.pot`;
cfg.translate_php_options = {
    domain: cfg.template_files_variables.text_domain,
    package: cfg.template_files_variables.plugin_title,
    lastTranslator: cfg.template_files_variables.plugin_author,
    team: cfg.template_files_variables.plugin_author,
};

// ZIP files.
cfg.zip_files = [
    {
        src: '{dist}/**/*',
        dist: '{dist_root}/{name}.zip',
    },
];

// Watch files.
cfg.watch_files = [
    '{src}/**/*',
    '!{src}/**/*.{php,jsx,js,scss}',
];

cfg.watch_js_files = [
    '{src}/**/*.js',
    '!{src}/*vendor/**/*',
];

cfg.watch_jsx_files = [
    '{src}/**/*.jsx',
    '!{src}/*vendor/**/*',
];

cfg.watch_scss_files = '{src}/**/*.scss';

module.exports = cfg;
```

## Usage

```$ npx wpde <options>```

## Options

- `-b`, `--build`     build theme/plugin
- `-w`, `--watch`     start watch changes in files and automatically run 'build' after changes
- `-z`, `--zip`       prepare ZIP file after build

## Other options

- `--config`          custom config, by default used automatic way. Custom example: `--config="wpde.config.js"`
- `-h`, `--help`      show usage information
- `-v`, `--version`   show version info

## Example

```$ npx wpde --build --watch```
