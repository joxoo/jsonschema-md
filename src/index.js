#!/usr/bin/env node

var file = process.argv[2],
    parser = require('./parser'),
    tokens = require('./tokens'),
    markdown = require('./generator/markdown'),
    stdout   = process.stdout,
    stderr   = process.stderr;

if(!file) {
    console.error('No json schema file specified');
    process.exit();
}

try {

    var schema = parser(file, tokens),
        generator = new markdown(tokens);
        schema.parse( function ( err ) {
            if (err) {
                stderr.write(String(err));
                stderr.write(err.stack);
                process.exit();
                return;
            }
            var output = generator.generate();
            stdout.write(output);
        });

} catch(e) {
    stderr.write(String(e));
    stderr.write(e.stack);
    process.exit();
}
