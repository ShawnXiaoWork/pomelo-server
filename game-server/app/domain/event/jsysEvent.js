var consts = require('../../consts/consts');
var messageService = require('./../messageService');

var exp = module.exports;

/**
 * Handler npc event
 */
exp.addEventForJsys = function (jsys){
	/**
	 * Hanlde npc talk event
	 */
	jsys.on('betStart', function(){ //开始下注通知
		logger.debug('event.start bet:');
		messageService.broadcastMessage();
	});

	jsys.on('statusInfo',function(){//玩家下注通知

	});
	
	jsys.on('result',function(){//游戏结算通知

	});
};
