
module.exports = function(grunt) {
    var config = {
        credentials: require("./Gruntfile.credentials.js"),

        "shell": {
            options: {
                stdout: true,
                stdin: false
            },
            "build_site_for_dev": {
                command: "jekyll build --config _config.yml,_dev.yml"
            },
            "build_site_for_prod": {
                command: "rm -fr _site/* && jekyll build --config _config.yml,_prod.yml"
            },
            "serve_site": {
                command: "jekyll serve --no-watch --baseurl ''",
                spawn: true
            }
        },

        "watch": {
            "build_site_for_dev": {
                files: ["*.yml", "*.html", "_assets/**/*", "_data/**/*", "_layouts/**/*", "_posts/**/*", ],
                tasks: ["shell:build_site_for_dev"],
                options: {
                    interrupt: true,
                    debounceDelay: 250
                }
            }
        },

        "compress": {
            "compress_site_files": {
                options: {
                    mode: 'gzip'
                },
                files: [
                    { expand: true, src: "_site/**/*.html", dest: "", ext: ".html.gz" }
                ]
            }
        },

        "aws_s3": {
            "upload_site": {
                options: {
                    accessKeyId: "<%= credentials.aws_access_key %>",
                    secretAccessKey: "<%= credentials.aws_secret_key %>",
                    region: "eu-west-1",
                    bucket: "pracucci.com",
                    progress: "dots",
                    uploadConcurrency: 4,
                    gzipRename: "ext",
                    differential: true
                },
                files: [
                    // NOTES:
                    // - Due to a bug with custom `params` we have to upload each file type separately
                    // - No .js since we include it inline
                    // - We upload the compressed version of .html files
                    { action: "upload", cwd: "_site", src: "**/*.html.gz",      dest: "/", expand: true, params: { CacheControl: "max-age=0" } },
                    { action: "upload", cwd: "_site", src: "**/*.xml",          dest: "/", expand: true, params: { CacheControl: "max-age=0" } },
                    { action: "upload", cwd: "_site", src: "**/*.txt",          dest: "/", expand: true, params: { CacheControl: "max-age=0" } },
                    { action: "upload", cwd: "_site", src: "assets/**/*.png",   dest: "/", expand: true, params: { CacheControl: "max-age=31536000" } },
                    { action: "upload", cwd: "_site", src: "assets/**/*.jpg",   dest: "/", expand: true, params: { CacheControl: "max-age=31536000" } },
                    { action: "upload", cwd: "_site", src: "assets/**/*.ai",    dest: "/", expand: true, params: { CacheControl: "max-age=31536000" } },
                    { action: "upload", cwd: "_site", src: "assets/**/*.css.gz",dest: "/", expand: true, params: { CacheControl: "max-age=31536000" } },
                    { action: "upload", cwd: "_site", src: "assets/**/*.ico",   dest: "/", expand: true, params: { CacheControl: "max-age=31536000" } }
                ]
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-aws-s3");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask(
        "serve",
        [
            "shell:serve_site",
        ]
    );

    grunt.registerTask(
        "dev",
        [
            "shell:build_site_for_dev",
            "watch:build_site_for_dev"
        ]
    );

    grunt.registerTask(
        "publish",
        "Publishes the website",
        [
            "shell:build_site_for_prod",
            "compress:compress_site_files",
            "aws_s3:upload_site"
        ]
    );
};
