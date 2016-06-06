var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = require('../consts/consts').EntityType;

var exp = module.exports;

exp.broadcastMessage = function(stype,route,msg){
	pomelo.app.get('channelService').broadcast(stype,route,msg,{binded:true},errHandler); //自0.4.x 的配置只有一个参数 opts.binded Boolean type true 根据session 的uid 进行广播，false 根据session的id 进行广播
}

exp.pushMessageByUids = function (uids, route, msg) {
	pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, errHandler);
};

exp.pushMessageToPlayer = function (uid, route, msg) {
  exp.pushMessageByUids([uid], route, msg);
};

exp.pushMessageByAOI = function (area, msg, pos, ignoreList) {
  var uids = area.timer.getWatcherUids(pos, [EntityType.PLAYER], ignoreList);

  if (uids.length > 0) {
    exp.pushMessageByUids(uids, msg.route, msg);
  }
};

function errHandler(err, fails){
	if(!!err){
		logger.error('Push Message error! %j', err.stack);
	}
}