var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var wechat = require('wechat');
var moment = require('moment');
var mqtt = require('mqtt');


var config = {
  token: 'XIgo2638ZdNfRAd',
  appid: 'wx3b1b0fde6b8b7320',
  encodingAESKey: 'cupOikGXIgo2638ZdNfRAdHCkNasBdIqaeHla7u18aM'
};

//var t_mqtt = mqtt.connect( {port:1883, host:'127.0.0.1', client:'mqtt@nexpaq.com'} );
var client = mqtt.connect( {host:'127.0.0.1'} );

var debugMode = true;
exports.debug = debug = function(info) {
  if (debugMode === true) {
//    console.log('  -- ［' + moment().format('YYYY-MM-DD HH:mm:ss') + ' DEBUG --  '+info);
      console.log('  -- ' + moment().format('YYYY-MM-DD HH:mm:ss') + ' DEBUG --  ');
      console.log(info);
      console.log('');
  }
};

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:'Super Secret Session Key', saveUninitialized: true, resave:true}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.query());

app.use('/wechat', wechat(config, wechat.text(function(message, req, res, next){
  debug(message);
  // MQTT channel
  client.publish( 'Channel', message.Content );
  res.reply( { type:"text", content:"You type:"+message.Content} );
}).image(function(message, req, res, next){
  debug(message);
  res.reply( { type:"text", content:"You send me a photo"} );
}).voice(function(message, req, res, next){
  debug(message);
  res.reply( { type:"text", content:"You send me a voice， you try to say: "+message.Recognition} );
  // MQTT channel
  client.publish( 'Channel', message.Recognition );
})));

var router = express.Router();
router.route('/message').get(function(req,res){
  res.json( {info:'Sucess'} );
});
app.use('/api/v0', router);

app.listen(8000);
