const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ora = require('ora');
const Ftp = require('ftp');
const utils = require('./utils');
const findBase = utils.findBase;
const logError = utils.logError;

let basePath;
let c;
let spinner;

module.exports = (projectName, options) => {
    spinner = ora('uploading');
    c = new Ftp();
    basePath = findBase();
    if(!basePath) {
        return false;
    }
    const o = resetOptions(projectName, options);
    if(!o || !o.name) {
        return console.log(logError('本地发布文件夹(默认dist)不存在!请确认已执行build命令或\'-l\'参数手动指定。'));
    }
    let localPath = path.posix.join(basePath, o.localPath);
    let remotePath = path.posix.join(o.remotePath, o.name);
    if(!fs.existsSync(localPath)){
        return console.log(logError('本地发布文件夹(默认dist)不存在!请确认已执行build命令或\'-l\'参数手动指定。'));
    }
    c.on('error', (err) => {
        console.log(logError('连接错误，错误信息:' + err));
    });
    c.connect({
        user: o.user,
        password: o.password,
        host: o.host
    });
    ftp(localPath, remotePath, o.force);
    console.log('即将上传' + '"' + localPath + '"');
};

function resetOptions(projectName, options) {
    const defaultOptions = {
        user: '',
        password: '',
        host: 'localhost',
        localPath: 'dist',
        remotePath: '',
        name: projectName
    };

    let configOptions = {};
    if(fs.existsSync(basePath + '/config/config.js')){
        const config = require(basePath + '/config/config.js');
        if(config.ftp){
            configOptions = config.ftp;
        }
        if(!defaultOptions.name){
            defaultOptions.name = config.name ? config.name : "";
        }
    }
    Object.assign(defaultOptions, configOptions, options);
    return defaultOptions;
}

async function ftp(localPath, remotePath, force) {
    try {
        await ready();
        if(!force){
            let result = await check(remotePath);
            if(result){
                let answer = await cmd('项目已存在，如何操作？(\'r\'重新上传;\'y\'覆盖;\'n\'放弃):');
                if(answer === 'r') {
                    await remove(remotePath);
                } else if(answer === 'n') {
                    console.log(logError('放弃上传，连接关闭。'));
                    return c.end();
                }
            }
        }
        spinner.start();
        await upload(localPath, remotePath);
    } catch (e) {
        spinner.fail('error:' + e);
        return c.end();
    }
}

async function upload(localPath, remotePath) {
    await mkDir(remotePath, true);
    let localInfoArr = fs.readdirSync(localPath);
    let tempLocal, tempRemote;
    for (let i = 0; i < localInfoArr.length; i++){
        tempLocal = localPath + '/' + localInfoArr[i];
        tempRemote = remotePath + '/' + localInfoArr[i];
        if(fs.statSync(tempLocal).isDirectory()) {
            await upload(tempLocal, tempRemote);
        } else {
            await put(tempLocal, tempRemote);
        }
    }
}

async function remove(name) {
    let subPath = name + '/';
    let infoArr = await list(subPath);
    let len = infoArr.length;
    let temp;
    for (let i = 0; i < len; i++){
        temp = infoArr[i];
        if(temp.type === 'd') {
            if(temp.name !== '.' && temp.name !== '..') {
                await remove(subPath + temp.name);
            }
        } else {
            await del(subPath + temp.name);
        }
    }
    await rmDir(name);
}

async function check(name) {
    let l;
    try {
        l = await list(name);
    } catch (e) {
        return false;
    }
    return true;
}

function ready() {
    return new Promise(function (resolve, reject) {
        c.on('ready', function () {
            resolve();
        })
    });
}

// 控制台输入
function cmd(question) {
    return new Promise(function (resolve, reject) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let questionFunc = () => {
            rl.question(question, (answer) => {
                if(answer === 'y' || answer === 'n' || answer === 'r') {
                    rl.close();
                    resolve(answer);
                } else {
                    questionFunc();
                }
            })
        };
        questionFunc();
    })
}

// ------ FTP API 转换
function list(...arg) {
    return new Promise(function (resolve, reject) {
        c.list(...arg, function (err, res) {
            if(err)reject(err);
            resolve(res);
        })
    })
}

function put(...arg) {
    return new Promise(function (resolve, reject) {
        c.put(...arg, function (err, res) {
            if(err)reject(err);
            resolve(res);
        })
    })
}

function del(...arg) {
    return new Promise((resolve,reject)=>{
        c.delete(...arg,function (err,res) {
            if (err)reject(err);
            resolve(res)
        })
    })
}

function rmDir(...arg) {
    return new Promise((resolve,reject)=>{
        c.rmdir(...arg,function (err,res) {
            if (err)reject(err);
            resolve(res)
        })
    });
}

function mkDir(...arg) {
    return new Promise((resolve,reject)=>{
        c.mkdir(...arg,function (err,res) {
            if (err)reject(err);
            resolve(res)
        })
    })
}

function cwd(...arg) {
    return new Promise((resolve,reject)=>{
        c.cwd(...arg,function (err,res) {
            if (err)reject(err);
            resolve(res)
        })
    })
}