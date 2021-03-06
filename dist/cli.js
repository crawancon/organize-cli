#!/usr/bin/env node


'use strict';

var yargs = require('yargs');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var ora = require('ora');

var _require = require('./helpers'),
    organizeByDefaults = _require.organizeByDefaults,
    organizeBySpecificFileTypes = _require.organizeBySpecificFileTypes,
    organizeByDates = _require.organizeByDates;

var argv = yargs.usage('Usage: $0 [options]').alias('o', 'output').describe('o', "Output directory - Creates one if doesn't exist").string('o').alias('d', 'date').describe('d', 'Organize files by dates').boolean('d').alias('s', 'source').describe('s', 'Source directory to organize').string('s').alias('t', 'type').describe('t', 'Specific types to organize - strings of file extensions').array('t').alias('f', 'folder').describe('f', 'Specific folder to move specific files to').string('f').demand(['s']).example('$0 -s ~/Downloads -o . -t mp3 wav -f "Songs"').help('h').alias('h', 'help').argv;

var spinner = ora('Scanning').start();

var sourceDir = argv.source ? path.resolve(process.cwd(), argv.source) : process.cwd();
var outputDir = argv.output ? path.resolve(process.cwd(), argv.output) : sourceDir;

var names = fs.readdirSync(sourceDir);
var moved = [];

if (argv.d) {
  moved = organizeByDates(names, sourceDir, outputDir, spinner);
} else if (argv.t && argv.f) {
  var spFormats = argv.t;
  var spFolder = argv.f;

  moved = organizeBySpecificFileTypes(spFormats, spFolder, names, sourceDir, outputDir, spinner);
} else {
  moved = organizeByDefaults(names, sourceDir, outputDir, spinner);
}

Promise.all(moved.map(function (p) {
  return p.catch(function (e) {
    return e;
  });
})).then(function (messages) {
  var isError = false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var message = _step.value;

      if (message instanceof Error) {
        spinner.fail("Couldn't move all files!");
        isError = true;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (!isError) {
    spinner.succeed('Moved all files!');
  }
}).catch(function (err) {
  return spinner.fail('An error occured!');
});