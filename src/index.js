const file = process.argv[2];
const parser = require('./parser');
const tokens = require('./tokens');
const Markdown = require('./generator/markdown');
const stdout = process.stdout;
const stderr = process.stderr;

if (!file) {
  console.error('No json schema file specified');
  process.exit();
}

try {
  const schema = parser(file, tokens);
  const generator = new Markdown(tokens);
  schema.parse((err) => {
    if (err) {
      stderr.write(String(err));
      stderr.write(err.stack);
      process.exit();
      return;
    }
    const output = generator.generate();
    stdout.write(output);
  });
} catch (e) {
  stderr.write(String(e));
  stderr.write(e.stack);
  process.exit();
}
