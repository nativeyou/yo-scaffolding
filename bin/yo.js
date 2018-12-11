#!/usr/bin/env node

const program = require('commander');
const init = require('./yo-init');
const publish = require('./yo-publish');
const page = require('./yo-page');
const {logSuccess, logError, logDoc} = require('./utils');

program
    .version(require('../package').version)
    .option('-v, --version', '版本号');

program
    .command('init <projectName> [template]')
    .description('初始化项目。必须输入项目名称，可选输入模板名称。')
    .action((projectName, template) => { init(projectName, template); });

program
    .command('page <pageName>')
    .description('创建页面。文件名为页面名称')
    .option('-m, --mobile', '创建移动端页面')
    .option('-r, --rem', '使用rem方式布局')
    .action( (pageName, options) => { page(pageName, options) });

program
    .command('publish [projectName]')
    .description('发布项目，可选输入项目名称')
    .option('-l, --localPath <localPath>', '手动配置dist文件夹目录(相对于项目根目录)')
    .option('-r, --remotePath <remotePath>', '手动配置远程文件夹目录(相对于FTP根目录)')
    .option('-h, --host <host>', '手动输入host地址')
    .option('-u, --user <user>', '用户名')
    .option('-p, --password <password>', '用户名')
    .option('-f, --force', '强制覆盖')
    .option('-a, --auto', '自动打包并上传')
    .action((projectName, options) => { publish(projectName, options) });

if(!process.argv.slice(2).length) {
    program.help(() => {
        return logError('gxm-cli:缺少命令\n请使用-h或--help查看，或参考') + logDoc();
    });
}

const commandList = ['-h','-V','-v','init','publish','page'];

if(commandList.toString().indexOf(process.argv[2]) === -1) {
    console.log(logError('gxm-cli:命令不正确\n请使用-h或--help查看，或参考') + logDoc());
}

program.parse(process.argv);