const fs = require('fs');
const fse = require('fs-extra');
const vm = require('vm');
const path = require('path');
const inquirer = require('inquirer');

const utils = require('./utils');
const logError =utils.logError;
const logSuccess =utils.logSuccess;
const findBase = utils.findBase;
const delFileAll = utils.delFileAll;

const _ = require('lodash');

_.pascalCase = _.flow(_.camelCase, _.lowerFirst);
_.upperSnakeCase = _.flow(_.snakeCase, _.toUpper);

module.exports = (pageName, options) => {
    let pagePath = options.path || '/src/pages';

    options.name = pageName;
    options.actionName = _.upperSnakeCase(pageName);
    options.funcName = _.pascalCase(pageName);

    let dirPath, basePath, templatePath;

    basePath = findBase();
    if(!basePath) {
        return false;
    }

    templatePath = path.join(basePath, 'config/template.js');
    if(!fs.existsSync(templatePath)) {
        return console.log(logError('无法找到template模板文件'));
    }

    let templateFile = fs.readFileSync(templatePath);
    let template = vm.runInContext(templateFile, vm.createContext({module: module, yo: options}));

    pagePath = path.join(basePath, pagePath);
    if(!fs.existsSync(pagePath)) {
        fse.mkdirsSync(pagesPath)
    }
    dirPath = path.join(pagePath, pageName);
    if(fs.existsSync(dirPath)) {
        inquirer.prompt([
            {
                name: 'currentPage',
                message: '页面已存在，请确认，否则页面将被覆盖',
                type: 'confirm',
                default: true
            }
        ]).then(answer => {
            if(answer.currentPage) {
                delFileAll(dirPath);
                createPage(dirPath, template);       
            }
        });
    } else {
        createPage(dirPath, template);
    }
};

function createPage(dirPath, template) {
    fse.mkdirsSync(dirPath);
    for (let file of Object.keys(template)) {
        fse.outputFileSync(`${dirPath}/${file}`, template[file]);
    }

    return console.log(logSuccess('创建成功'));
};