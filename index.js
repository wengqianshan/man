// 初稿，未优化

let fs = require('fs')
let colors = require('colors')
let wav = require('wav')
const config = require('./config').baidu

let Speech = require('./sdk/baidu-ai/index').speech
// http://yuyin.baidu.com/app
let API_ID = config.id
let API_KEY = config.key
let SECRET_KEY = config.secret

let client = new Speech(API_ID, API_KEY, SECRET_KEY)

const record = require('node-record-lpcm16');
const snowboy = require('snowboy');
const Detector = snowboy.Detector;
const Models = snowboy.Models;
const player = require('play-sound')(opts = {})

const models = new Models();

let yun = require('./yun')

// 正在听
let listening = true
// 保存输入流
let bufferList = [];
// 记录听到指令时间
let hotwordTime = null
// 

models.add({
  file: './sg.pmdl',
  sensitivity: '0.5',
  hotwords: 'snowboy'
});

const detector = new Detector({
  resource: "resources/common.res",
  models: models,
  audioGain: 2.0
});

detector.on('silence', function () {
  let now = +new Date()
  if (now - hotwordTime < 2000) {
    return
  }
  console.log('沉默...');
  if (bufferList.length > 0) {
    let data = Buffer.concat(bufferList);
    console.log('原声'.yellow, data)
    let voiceBuffer = new Buffer(data)
    console.log('原声buffer'.yellow, voiceBuffer)
    let file = new wav.FileWriter('./origin.wav', {sampleRate: 8000})
    file.write(voiceBuffer)
    file.end()
    // fs.writeFileSync('./original.mp3', voiceBuffer)
    // 这里可以调用阿里云接口识别 TODO 
    yun(voiceBuffer)
    client.recognize(voiceBuffer, 'wav', 16000).then(function (res) {
      // 识别结果
      console.log('百度语音识别结果: '.yellow + '=> ' + JSON.stringify(res));
      let r = res.result
      if (r && r.length > 0) {
        client.text2audio(r.join(''), { per: 1 }).then(function (result) {
          // console.log('百度文字转语音'.red, result)
          fs.writeFileSync('./temp.mp3', result.data);
          player.play('./temp.mp3', function (err) {
            setTimeout(() => {
              listening = true
            }, 1000)
            console.log('传播放完毕, 继续倾听'.yellow)
            player.play('./resources/ding.wav')
          })

        });
      } else {
        player.play('./error.wav', function (err) {
          console.log('传播放完毕, 继续倾听'.yellow)
          setTimeout(() => {
            listening = true
          }, 1000)
        })
      }
    }, function (err) {
      listening = true
      console.log(err);
    });
    bufferList.length = 0

  } else {
    listening = true
    bufferList.length = 0
  }

});

detector.on('sound', function (buffer) {
  // <buffer> contains the last chunk of the audio that triggers the "sound"
  // event. It could be written to a wav stream.
  console.log('有动静~');
  if (listening === true) {
    bufferList.length = 0
    return
  }
  bufferList.push(buffer);
});

detector.on('error', function () {
  console.log('error');
});

detector.on('hotword', function (index, hotword, buffer) {
  // <buffer> contains the last chunk of the audio that triggers the "hotword"
  // event. It could be written to a wav stream. You will have to use it
  // together with the <buffer> in the "sound" event if you want to get audio
  // data after the hotword.
  if (listening === false) {
    return;
  }
  listening = false;
  hotwordTime = +new Date();
  //console.log(buffer);
  console.log('唤醒词', index, hotword);
  console.log('嗯，你说...')
  player.play('./resources/dong.wav', function (err) {
    console.log('dongdong结束+++++++++++++++++++++++++++++++++++')
    if (err) {
      console.log(err.red)
    }
    
  })

});

const mic = record.start({
  threshold: 0,
  verbose: true
});

mic.pipe(detector);
