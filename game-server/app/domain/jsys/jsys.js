var Timer = require('./timer');
var eventManager = require('./../event/eventManager');
var logger = require('pomelo-logger').getLogger(__filename);
var channelUtil = require('../../util/channelUtil')

var Instance = function(opts) {
	this.jsysId = opts.id;
	this.users = {};
	this.channel = null;
	this.user_num = 0;
	this.empty_time = Date.now();
	this.timer = new Timer({
		jsys:this,
		interval:100
	})

	this.start();
}

module.exports = Instance;

Instance.prototype.start = function(){
	this.timer.run();
}

Instance.prototype.close = function(){
	this.timer.close();
}

Instance.prototype.getChannel = function() {
  if(!this.channel){
    var channelName = channelUtil.getAreaChannelName(this.areaId);
    utils.myPrint('channelName = ', channelName);
    this.channel = pomelo.app.get('channelService').getChannel(channelName, true);
  }

  utils.myPrint('this.channel = ', this.channel);
  return this.channel;
};