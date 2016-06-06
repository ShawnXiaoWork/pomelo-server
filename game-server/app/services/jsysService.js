var Code = require('../../../shared/code');
var utils = require('../util/utils');
var dispatcher = require('../util/dispatcher');
var Event = require('../consts/consts').Event;

var JsysService = function(app) {
  this.app = app;
  this.userMap = {};
  this.channelMap = {};
};

module.exports = JsysService;

/**
 * Add player into the channel
 *
 * @param {String} uid         user id
 * @param {String} playerName  player's role name
 * @param {String} channelName channel name
 * @return {Number} see code.js
 */
JsysService.prototype.add = function(user,channelName) {
  var sid = getSidByUid(user.id, this.app);
  if(!sid) {
    return Code.JSYS.FA_UNKNOWN_CONNECTOR;
  }

  if(checkDuplicate(this, user.id, channelName)) {
    return Code.OK;
  }

  utils.myPrint('channelName = ', channelName);
  var channel = this.app.get('channelService').getChannel(channelName, true);
  if(!channel) {
    return Code.CHAT.FA_CHANNEL_CREATE;
  }

  channel.add(user, sid);// 加入玩家
  return Code.OK;
};

/**
 * User leaves the channel
 *
 * @param  {String} uid         user id
 * @param  {String} channelName channel name
 */
JsysService.prototype.leave = function(uid, channelName) {
  var record = this.userMap[uid];
  var channel = this.app.get('channelService').getChannel(channelName, true);

  if(channel && record) {
    channel.leave(uid, record.sid);
  }

  removeRecord(this, uid, channelName);
};

/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid user id
 */
JsysService.prototype.kick = function(uid) {
  var channelNames = this.channelMap[uid];
  var record = this.uidMap[uid];

  if(channelNames && record) {
    // remove user from channels
    var channel;
    for(var name in channelNames) {
      channel = this.app.get('channelService').getChannel(name);
      if(channel) {
        channel.leave(uid, record.sid);
      }
    }
  }

  clearRecords(this, uid);
};

/**
 * Push message by the specified channel
 *
 * @param  {String}   channelName channel name
 * @param  {Object}   msg         message json object
 * @param  {Function} cb          callback function
 */
JsysService.prototype.pushByChannel = function(channelName, msg, cb) {
  var channel = this.app.get('channelService').getChannel(channelName);
  if(!channel) {
    cb(new Error('channel ' + channelName + ' dose not exist'));
    return;
  }

  channel.pushMessage(Event.chat, msg, cb);
};

/**
 * Push message to the specified player
 *
 * @param  {String}   playerName player's role name
 * @param  {Object}   msg        message json object
 * @param  {Function} cb         callback
 */
JsysService.prototype.pushByPlayerName = function(playerName, msg, cb) {
  var record = this.nameMap[playerName];
  if(!record) {
    cb(null, Code.CHAT.FA_USER_NOT_ONLINE);
    return;
  }

  this.app.get('channelService').pushMessageByUids(Event.chat, msg, [{uid: record.uid, sid: record.sid}], cb);
};

JsysService.prototype.broadcast = function(msg,cb){ //广播消息
  this.app.get('channelService').pushMessageByUids(Event.chat, msg, , cb);
};

/**
 * Cehck whether the user has already in the channel
 */
var checkDuplicate = function(service, uid, channelName) {
  return !!service.channelMap[uid] && !!service.channelMap[uid][channelName];
};

/**
 * Get the connector server id assosiated with the uid
 */
var getSidByUid = function(uid, app) {
  var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
  if(connector) {
    return connector.id;
  }
  return null;
};
