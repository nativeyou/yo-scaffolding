const program = require('commander');
const init = require('./init');
const {logSuccess, logError, logDoc} = require('./utils');

program.version(require('../package').version).option('-v, --version', '版本号');

program.command('init <projectName> [template]').description('初始化项目。必须输入项目名称，可选输入模板名称。').action((projectName, template) => { init(projectName, template); });

if(!process.argv.slice(2).length) {
    program.help(() => {
        return logError('gxm-cli:缺少命令\n请使用-h或--help查看，或参考') + logDoc();
    });
}

const commandList = ['-h','-V','-v','init','publish','page'];

console.log(process.argv);

if(commandList.toString().indexOf(process.argv[2]) === -1) {
    console.log(logError('gxm-cli:命令不正确\n请使用-h或--help查看，或参考') + logDoc());
}

program.parse(process.argv);