// 初稿，未优化
var fs = require('fs');
let colors = require('colors')
var request = require('request');
var url = require('url');
var crypto = require('crypto');
var date = new Date().toUTCString()
let config = require('./config').aliyun
// https://ak-console.aliyun.com/#/accesskey
var ak_id = config.id;
var ak_secret = config.secret;
// const fileStr = fs.readFileSync('./tempfile.wav');
// console.log(fileStr, '+++++++++++++++++++++++++++++++++++')

function speak (text, cb) {
    var options = {
        url : 'http://nlsapi.aliyun.com/speak?encode_type=wav&voice_name=xiaogang&sample_rate=16000&volume=100',
        method: 'POST',
        body: text,
        headers: {
          'accept': 'audio/wav; application/json',
          'content-type': 'text/plain',
          'date': date,
          'Authorization': ''
        },
        encoding: null
      };
      md5 = function(buffer) {
        var hash;
        hash = crypto.createHash('md5');
        hash.update(buffer);
        return hash.digest('base64');
      };
      sha1 = function(stringToSign, secret) {
        var signature;
        return signature = crypto.createHmac('sha1', secret).update(stringToSign).digest().toString('base64');
      };
      // step1: 组stringToSign [StringToSign = #{method}\\n#{accept}\\n#{data}\\n#{contentType}\\n#{date}\\n#{action}]
      var body = options.body || '';
      var bodymd5;
      if(body === void 0 || body === ''){
        bodymd5 = body;
      } else {
        bodymd5 = md5(body);
      }
      console.log(bodymd5)
      // var stringToSign = options.method + "\n" + options.headers.accept + "\n" + bodymd5 + "\n" + options.headers['content-type'] + "\n" + options.headers.date + "\n" + url.parse(options.url).path;
      var stringToSign = options.method + "\n" + options.headers.accept + "\n" + bodymd5 + "\n" + options.headers['content-type'] + "\n" + options.headers.date;
      console.log("step1-Sign string:", stringToSign);
      // step2: 加密 [Signature = Base64( HMAC-SHA1( AccessSecret, UTF-8-Encoding-Of(StringToSign) ) )]
      var signature = sha1(stringToSign, ak_secret);
      // console.log("step2-signature:", signature);
      // step3: 组authorization header [Authorization =  Dataplus AccessKeyId + ":" + Signature]
      var authHeader = "Dataplus " + ak_id + ":" + signature;
      console.log("step3-authorization Header:", authHeader);
      options.headers.Authorization = authHeader;
      console.log('authHeader', authHeader);
      // step4: send request
      function callback(error, response, body) {
        if (error) {
          console.log("error", error)
        }
        cb(body)
        // console.log("阿里云文字转语音结果: ".yellow, '=> ', body)
      }
      request(options, callback);
}

module.exports = speak