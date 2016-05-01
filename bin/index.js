#!/usr/bin/env node
const argv = require('yargs').argv;
const process = require('../src/index');
const path = require('path');

if (argv._.length === 0) {
  errHandler('No arguments, exiting!', 'err');
}

const file = path.resolve(argv._[0]); // assign the argument as file and resolve absolute path
const outputFile = !!argv._[1] ? path.resolve(argv._[1]) : path.basename(file).split('.')[0]; // take the output from args or get it from base filename

process(file, outputFile);
