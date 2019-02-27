
const {Command} = require('commander');
const commander = new Command();
const path = require('path')
const fs = require('fs')
const ui = require('./output')
const resolveGlobal = require('resolve-global')

commander
  .version(require('../package.json').version);

commander.option('-v, --verbose', 'ignore test hook');
commander.on('option:verbose', function () {
  process.env.VERBOSE = this.verbose;
});

// error on unknown commands
commander.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
  process.exit(1);
});

function resolve_generator(name, model_path) {
  var generator_path = [
    (path.dirname(resolveGlobal.silent(name)||''))+'/generator.json',
    name, name+'.json',
    path.resolve(name), path.resolve(name+'.json'),
    path.resolve(path.join(model_path, name)),
    path.resolve(path.join(model_path, name + '.json'))
  ].filter(fs.existsSync)
  
  
  if(generator_path.length < 1){
    throw 'generator not found for: '+name
  }

  ui.log('loading generator: ', generator_path[0]);
  
  return require('./generator').load(generator_path[0])
}

commander.command('generate <model_path> <output_path>')
.description('runs the generators')
.action((model_path, output_path)=>{
  const model = require('./model').load(model_path);
  model.generators.forEach(
    (g)=>resolve_generator(g, path.dirname(model_path)).generate(model, output_path)
  )
})

module.exports = commander;
