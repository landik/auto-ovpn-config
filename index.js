const fs = require('fs');
const path = require('path');
const config = require('./config.js');

// Полный путь к папке с сертификатами и ключами
const dirFrom = path.resolve(__dirname,config.from);
// Полный путь куда будут сложены готовые конфигурации
const dirTo = path.resolve(__dirname,config.to);

if(!fs.existsSync(dirFrom)) exit('Директория не найдена:'+dirFrom);
if(!fs.existsSync(dirTo)) fs.mkdirSync(dirTo);
const list = readDir(dirFrom);

if(list.tls && list.ca && list.users.length){
    // Считываем шаблон
    const temp = fs.readFileSync(path.join(__dirname,config.template), 'utf8');
    // Считываем tls ключ
    const tlsKey = readKey(fs.readFileSync(path.join(dirFrom,list.tls), 'utf8'));
    // Считываем сертификат подтверждающего центра
    const caCrt = readKey(fs.readFileSync(path.join(dirFrom,list.ca), 'utf8'));
    // Вставляем в шаблон tls ключ и сертификат подтверждающего центра
    const tempWithTlsCa = temp.replace('%TLS%',tlsKey).replace('%CA%',caCrt);
    list.users.forEach(item => {
        try{
            const key = readKey(fs.readFileSync(path.join(dirFrom,item+".key"), "utf8"));
            const cert = readKey(fs.readFileSync(path.join(dirFrom,item+".crt"), "utf8"));
            const conf = tempWithTlsCa.replace('%KEY%',key).replace('%CERT%',cert);
            fs.writeFileSync(path.join(dirTo,item+'.'+config.extension),conf);
        } catch (e) {
            if(e.syscall === 'open') console.log('Не найден файл:',e.path);
            else console.log(e);
        }
    })
} else {
    exit("Что то из следующего не найдено: ta.key, ca.crt или отсутстуют сертификаты и ключи пользователей")
}

/**
 * readDir - считавает файлы в директории где находятся ключи и сертификаты
 * input: dir<string> - полный путь к папке
 * output: {
 *     tls: null | ta.key
 *     ca: null | ca.crt
 *     users:[ ...names ]
 * }
 * */
function readDir(dir){
    const result = {
        tls:null,
        ca:null,
        users:[]
    };
    fs.readdirSync(dir).forEach(item => {
        const state = fs.statSync(path.join(dir,item));
        if(!state.isFile()) return;
        if(item === 'ta.key') result.tls = item;
        else if(item === 'ca.crt') result.ca = item;
        else if(item.match(/(\.crt|\.key)$/)){
            const name = item.match(/^(.*)(\.crt|\.key)$/)[1];
            if(!result.users.includes(name)) result.users.push(name);
        }
    });
    return result
}

/**
 * readKey - считывает, из переданного документа, ключ или сертификат
 * input: file<string> - ключ или сертификат
 * output: <string>  - ключ или сертификат без лишнего мусора
 * */
function readKey(file) {
    let key='';
    let write=false;
    const begins = [
        '-----BEGIN OpenVPN Static key V1-----',
        '-----BEGIN CERTIFICATE-----',
        '-----BEGIN PRIVATE KEY-----',
        '-----BEGIN ENCRYPTED PRIVATE KEY-----'
    ];
    const ends = [
        '-----END OpenVPN Static key V1-----',
        '-----END CERTIFICATE-----',
        '-----END PRIVATE KEY-----',
        '-----END ENCRYPTED PRIVATE KEY-----'
    ];
    const array = file.trim().split("\n");
    array.forEach(line=>{
        if(write || begins.includes(line)){
            write = true;
            key += line+"\n";
            if(ends.includes(line)) write = false
        }
    });
    return key.trim()
}

function exit(message) {
    console.log(message);
    process.exit(-1);
}