let fs = require('fs')
let colors = require('colors')
const player = require('play-sound')(opts = {})

const config = require('./config').baidu
let Speech = require('./sdk/baidu-ai/index').speech
// http://yuyin.baidu.com/app
let API_ID = config.id
let API_KEY = config.key
let SECRET_KEY = config.secret

let client = new Speech(API_ID, API_KEY, SECRET_KEY)

client.text2audio('薄雾浓云愁永昼。瑞脑消金兽。佳节又重阳，玉枕纱厨，半夜凉初透。东篱把酒黄昏后。有暗香盈袖。莫道不消魂，帘卷西风，人比黄花瘦。', { per: 1 }).then(function (result) {
    // console.log('百度文字转语音'.red, result)
    fs.writeFileSync('./tts-baidu.mp3', result.data);
    player.play('./tts-baidu.mp3')

  });