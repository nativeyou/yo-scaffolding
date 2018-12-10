const fs = require('fs');
const path = require('path');
const glob = require('glob');

const findBase = (newPath) => {
    let nowPath = newPath ? newPath : process.cwd();
    let configPath = '';

    configPath = glob.sync(nowPath + '/**/config', {
        ignore: '**/node_module/**'
    });

    if(configPath.length > 1) {
        return console.log('config文件夹不唯一，无法定位项目根目录，请确认是否在项目目录中执行');
    }

    while (true){
        if(path.resolve(nowPath, '..') === nowPath) {
            return console.log('未找到项目根路径，请确认是否在项目目录中执行');
        }

        configPath = path.resolve(nowPath, 'config');
        if(fs.existsSync(configPath)){
            return path.resolve(configPath, '..');
        } else {
            nowPath = path.resolve(nowPath, '..');
        }
    }
};

const logError = (text) => {
    return '\u001b[31m'+text+'\u001b[39m';
};

const logSuccess = (text) => {
    return '\u001b[32m'+text+'\u001b[39m';
};

const logDoc = () => {
    return '';
};

/**
 * 删除所有文件
 * @param path
 */
function delFileAll(path) {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            const curPath = path + '/' + file;
            if(fs.statSync(curPath).isDirectory()) {
                delFileAll(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

module.exports = {
    findBase: findBase,
    logError: logError,
    logSuccess: logSuccess,
    logDoc: logDoc,
    delFileAll: delFileAll
};