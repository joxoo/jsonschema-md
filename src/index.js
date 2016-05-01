const parser = require('./tasks/parser');
const tokens = require('./tasks/tokens');
const Markdown = require('./generator/markdown');
const errHandler = require('./common/errHandler');
const path = require('path');
const fs = require('fs');

const process = (file, output) => {
  if (!file) {
    errHandler('No File, exiting!', 'err');
  }
  const outputFile = output || path.basename(file).split('.')[0];
  try {
    const schema = parser(file, tokens);
    const generator = new Markdown(tokens);
    schema.parse((err) => {
      if (err) {
        errHandler(err, 'err');
      }
      const mdOutput = generator.generate();
      fs.writeFileSync(`${outputFile}`, mdOutput);
    });
  } catch (e) {
    errHandler(e, 'err');
  }
};

module.exports = process;
