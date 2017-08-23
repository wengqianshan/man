let wav = require('wav')
const player = require('play-sound')(opts = {})

let yun = require('./yun-tts')
yun('薄雾浓云愁永昼。瑞脑消金兽。佳节又重阳，玉枕纱厨，半夜凉初透。东篱把酒黄昏后。有暗香盈袖。莫道不消魂，帘卷西风，人比黄花瘦。', (res) => {
    console.log(res, '+++++++++++++++++++++++++++++')
    let voiceBuffer = res
    //console.log('原声buffer'.yellow, voiceBuffer)
    let file = new wav.FileWriter('./tts-aliyun.wav', {sampleRate: 8000})
    file.write(voiceBuffer)
    file.end()
    player.play('./tts-aliyun.wav')
})