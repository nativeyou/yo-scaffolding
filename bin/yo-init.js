const download = require('download-git-repo');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const utils = require('./utils');

const delFileAll = utils.delFileAll;

module.exports = (name, template) => {
    if(!template){
        template = 'nativeyou/map-pack';
    }

    if(fs.existsSync(name)){
        inquirer.prompt([
            {
                name: 'downloadProject',
                message: '当前目录已经存在同名项目，是否删除',
                type: 'confirm',
                default: true
            }
        ]).then(answer => {
            if(answer.downloadProject) {
                delFileAll(name);
                downloadFile(name, template);
            }
        });
        return false;
    } else {
        downloadFile(name, template);
    }
};

/**
 * github下载文件
 * @param name
 * @param template
 */
function downloadFile(name, template) {
    const spinner = ora('downloading');
    console.log('将创建' + name + '文件夹');
    spinner.start();
    download(template, name, (error) => {
        if(error){
            spinner.fail('failed:' + error);
        } else {
            spinner.succeed('download success');
            fs.readFile(`./${name}/config/config.js`, 'utf-8', (error, configText) => {
                configText = configText.replace('', name);
                fs.writeFile(`./${name}/config/config.js`, configText, (err) => {
                    console.log();
                    console.log(chalk.green(`cd ${name} 进入目录`));
                    console.log(chalk.green('npm install   安装'));
                    console.log(chalk.green('gulp          启动'));
                    console.log(chalk.green('gulp build    打包'));
                });
            })
        }
    });
}