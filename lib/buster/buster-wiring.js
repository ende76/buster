(function (glbl, buster) {
    if (typeof require == "function" && typeof module == "object") {
        buster = require("buster-core");

        module.exports = buster.extend(buster, require("buster-test"), {
            assertions: require("buster-assertions"),
            format: require("buster-format"),
            eventedLogger: require("buster-evented-logger")
        });

        buster.defineVersionGetter(module.exports, __dirname);
        require("sinon-buster");
    }

    if (buster.format) {
        var logFormatter = buster.create(buster.format);
        logFormatter.quoteStrings = false;
        var asciiFormat = buster.bind(logFormatter, "ascii");
    }

    if (buster.eventedLogger) {
        if (asciiFormat) {
            buster.console = buster.eventedLogger.create({ formatter: asciiFormat });
        }
        buster.log = buster.bind(buster.console, "log");
    }

    if (buster.assertions) {
        if (asciiFormat) {
            buster.assertions.format = asciiFormat;
        }
        buster.assert = buster.assertions.assert;
        buster.refute = buster.assertions.refute;

        // TMP, will add mechanism for avoiding this
        glbl.assert = buster.assert;
        glbl.refute = buster.refute;
        glbl.expect = buster.assertions.expect;

        // Assertion counting
        var assertions = 0;

        buster.assertions.on("pass", function () {
            assertions += 1;
        });
    }

    if (buster.testRunner) {
        buster.testRunner.onCreate(function (runner) {
            buster.assertions.bind(runner, { "failure": "assertionFailure" });
            buster.assertions.throwOnFailure = false;
            runner.console = buster.console;

            runner.on("test:start", function () {
                assertions = 0;
            });

            runner.on("context:start", function (context) {
                context.testCase.log = buster.bind(buster.console, "log");
            });
        });

        buster.testRunner.assertionCount = function () {
            return assertions;
        };
    }
}(typeof global != "undefined" ? global : this, typeof buster == "object" ? buster : null));