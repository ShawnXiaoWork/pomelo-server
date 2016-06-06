var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var dataApi = require('../util/dataApi');
var Player = require('../domain/entity/player');
var User = require('../domain/user');
var Account = require('../domain/account');
var consts = require('../consts/consts');
var equipmentsDao = require('./equipmentsDao');
var bagDao = require('./bagDao');
var fightskillDao = require('./fightskillDao');
var taskDao = require('./taskDao');
var async = require('async');
var utils = require('../util/utils');
var consts = require('../consts/consts');
var messageCode = require('../../../shared/messageCode');
var userDao = module.exports;

/**
 * Get user data by username.
 * @param {String} username
 * @param {String} passwd
 * @param {function} cb
 */
userDao.getUserInfo = function (account, passwd, cb) {
	var sql = 'select a.id,a.passwd,b.nickname,b.sex,b.photo,b.coin,b.zuan,b.signature,b.contect,b.vipExp from zjhaccount a join zjhuser b on a.id = b.id and a.id = ? and a.passwd = ?';
	var args = [account,passwd];
	pomelo.app.get('dbclient').query(sql,args,function(err, res) {
		if(err !== null) {
				utils.invokeCallback(cb, err, null);
		} else {
			console.log("this is get user info:" + account + passwd)
			if (!!res && res.length === 1) {
				var user = new User(res[0]);	
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb,{result:messageCode.LOGIN.INVALD_USERNAME_PASSWD,msg:""},null);
			}
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
userDao.getPlayersByUid = function(uid, cb){
	var sql = 'select * from Player where userId = ?';
	var args = [uid];

	pomelo.app.get('dbclient').query(sql,args,function(err, res) {
		if(err) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}

		if(!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
			return;
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get an user's all players by userId
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.getPlayer = function(playerId, cb){
	var sql = 'select * from Player where id = ?';
	var args = [playerId];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0){
			utils.invokeCallback(cb,null,[]);
			return;
		} else{
			utils.invokeCallback(cb,null, new Player(res[0]));
		}
	});
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
userDao.getPlayerByName = function(name, cb){
	var sql = 'select * from Player where name = ?';
	var args = [name];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if (err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0){
			utils.invokeCallback(cb, null, null);
		} else{
			utils.invokeCallback(cb,null, new Player(res[0]));
		}
	});
};

userDao.checkIdentifier = function(identifier,cb){ //检测唯一标识
	var sql = 'select * from zjhaccount where identifier = ?';
	var args = [identifier];

	pomelo.app.get('dbclient').query(sql,args,function(err,res){
		if (err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0){
			utils.invokeCallback(cb, -1, null);
		} else{
			var account = new Account(res[0]);
			utils.invokeCallback(cb, null, account);
		}
	});
}

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */
userDao.getPlayerAllInfo = function (playerId, cb) {
	async.parallel([
		function(callback){
			userDao.getPlayer(playerId, function(err, player) {
				if(!!err || !player) {
					logger.error('Get user for userDao failed! ' + err.stack);
				}
				callback(err,player);
			});
		},
		function(callback) {
			equipmentsDao.getEquipmentsByPlayerId(playerId, function(err, equipments) {
				if(!!err || !equipments) {
					logger.error('Get equipments for eqipmentDao failed! ' + err.stack);
				}
				callback(err,equipments);
			});
		},
		function(callback) {
			bagDao.getBagByPlayerId(playerId, function(err, bag) {
				if(!!err || !bag) {
					logger.error('Get bag for bagDao failed! ' + err.stack);
				}
				callback(err,bag);
			});
		},
		function(callback) {
			fightskillDao.getFightSkillsByPlayerId(playerId, function(err, fightSkills) {
				if(!!err || !fightSkills){
					logger.error('Get skills for skillDao failed! ' + err.stack);
				}
				callback(err, fightSkills);
			});
		},
		function(callback){
			taskDao.getCurTasksByPlayId(playerId, function(err, tasks) {
				if(!!err) {
					logger.error('Get task for taskDao failed!');
				}
				callback(err, tasks);
			});
		}
	], 
	function(err, results) {
		var player = results[0];
		var equipments = results[1];
		var bag = results[2];
		var fightSkills = results[3];
		var tasks = results[4];
		player.bag = bag;
		player.setEquipments(equipments);
		player.addFightSkills(fightSkills);
		player.curTasks = tasks || {};
		
		if (!!err){
			utils.invokeCallback(cb,err);
		}else{
			utils.invokeCallback(cb,null,player);
		}
	});
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function (username, cb){
	var sql = 'select * from	User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.length === 1) {
				var rs = res[0];
				var user = new User({id: rs.id, name: rs.name, password: rs.password, from: rs.from});
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb, ' user not exist ', null);
			}
		}
	});
};

/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function (uid, cb){
	var sql = 'select * from	User where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
			return;
		}

		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, new User(res[0]));
		} else {
			utils.invokeCallback(cb, ' user not exist ', null);
		}
	});
};

/**
 * delete user by username
 * @param {String} username
 * @param {function} cb Call back function.
 */
userDao.deleteByName = function (username, cb){
	var sql = 'delete from	User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
				utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createAccount = function (regiserInfo, cb){
	var identifier = "";
	if (regiserInfo.imei === null || regiserInfo.imsi === null || regiserInfo.mac === null){
		utils.invokeCallback(cb, {code: messageCode.REGISTER.IDENTIFIER_ERROR, msg:"please check imei ,imsi ,mac"}, null);
		return;
	}else{
		identifier = utils.base64encode(regiserInfo.imei + regiserInfo.imsi + regiserInfo.mac)
	}

	userDao.checkIdentifier(identifier,function(err,account) { //检测到重复帐号直接返回重复帐号
		if (err == null){
			utils.invokeCallback(cb, null, account);
			return;
		}
	})


	async.waterfall([ //首先创建账号然后生成玩家数据
		function(callback) {
			// body...
			var sql = 'insert into zjhaccount (identifier,unionid,system,pv,netmode,nickname,phone,versionName,versionCode,passwd,lastLoginTime) values(?,?,?,?,?,?,?,?,?,?,?)';
			var loginTime = Date.now();
			var passwd_str = identifier.substr(0, 10)
			var args = [identifier, regiserInfo.unionid,regiserInfo.system,regiserInfo.pv,regiserInfo.netmode,regiserInfo.nickname,regiserInfo.phone || 0,regiserInfo.versionName,regiserInfo.versionCode,passwd_str,loginTime];
			pomelo.app.get('dbclient').insert(sql, args, function(err,res){
				if(err !== null){
					callback(err,null)
				} else {
					var account = new Account({id: res.insertId, identifier: regiserInfo.identifier,unionid:regiserInfo.unionid,system:regiserInfo.system,pv:regiserInfo.pv,netmode:regiserInfo.netmode,nickname:regiserInfo.nickname,phone:regiserInfo.phone||'',versionName:regiserInfo.versionName,versionCode:regiserInfo.versionCode,passwd:res.passwd,lastLoginTime:loginTime});
					// utils.invokeCallback(cb, null, user);
					console.log("this is create a new account");
					callback(null,account)
					
				}
			});
		},
		function(account,callback){
            var sql = 'insert into zjhuser(id,vipExp,nickname,sex,signature,contect,coin,zuan,photo) values(?,?,?,?,?,?,?,?,?)';
            var args = [account.id,0,account.nickname,0,'','',0,0,''];
            pomelo.app.get('dbclient').insert(sql, args, function(err,res){
				if(err !== null){
					callback(err,null)
				} else {
					console.log("this is create a new user");
					utils.invokeCallback(cb,null,account);
				}
			});
		}
		],function(err,result){
			utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
			console.log(result);
		}
		);	
};


userDao.checkAccount = function(loginInfo,cb){
	userDao.getUserInfo(loginInfo.account,loginInfo.passwd,function(err,user){
		if (err != null){
			cb(err,null,null,null)
		}else{ //当前帐号存在
			utils.invokeCallback(cb,null,user,null)
			// userDao.insertLoginInfo(loginInfo,user,cb)
		}
	});
}


userDao.insertLoginInfo = function(loginInfo,user,cb){ //插入登录数据

}
/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (regiserInfo,cb){
	var identifier = "";
	if (regiserInfo.imei === null || regiserInfo.imsi === null || regiserInfo.mac === null){
		utils.invokeCallback(cb, {code: messageCode.REGISTER.IDENTIFIER_ERROR, msg:"please check imei ,imsi ,mac"}, null);
		return;
	}else{
		identifier = utils.base64encode(regiserInfo.imei + regiserInfo.imsi + regiserInfo.mac)
	}

	async.waterfall([ //首先创建账号然后生成玩家数据
		function(callback) {
			// body...
			var sql = 'insert into zjhaccount (identifier,unionid,system,pv,netmode,nickname,phone,versionName,versionCode,passwd,lastLoginTime) values(?,?,?,?,?,?,?,?,?,?,?)';
			var loginTime = Date.now();
			var args = [identifier, regiserInfo.unionid,regiserInfo.system,regiserInfo.pv,regiserInfo.netmode,regiserInfo.nickname,regiserInfo.phone || 0,regiserInfo.versionName,regiserInfo.versionCode,regiserInfo.passwd,loginTime];
			pomelo.app.get('dbclient').insert(sql, args, function(err,res){
				if(err !== null){
					callback(err,null)
				} else {
					var user = new User({id: res.insertId, identifier: regiserInfo.identifier,unionid:regiserInfo.unionid,system:regiserInfo.system,pv:regiserInfo.pv,netmode:regiserInfo.netmode,nickname:regiserInfo.nickname,phone:regiserInfo.phone||'',versionName:regiserInfo.versionName,versionCode:regiserInfo.versionCode,passwd:regiserInfo.passwd,lastLoginTime:loginTime});
					// utils.invokeCallback(cb, null, user);
					console.log("this is create a new account");
					callback(null,user)
					
				}
			});
		},
		function(user,callback){
            var sql = 'insert into zjhuser(id,nickname,sex,signature,contect,coin,zuan,photo) values(?,?,?,?,?,?,?,?)';
            var args = [user.id,user.nickname,0,'','',0,0,''];
            pomelo.app.get('dbclient').insert(sql, args, function(err,res){
				if(err !== null){
					callback(err,null)
				} else {
					console.log("this is create a new user");
					utils.invokeCallback(cb,null,user);
				}
			});
		}
		],function(err,result){
			utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
			console.log(result);
		}
		);
	
};

/**
 * Create a new player
 * @param {String} uid User id.
 * @param {String} name Player's name in the game.
 * @param {Number} roleId Player's roleId, decide which kind of player to create.
 * @param {function} cb Callback function
 */
userDao.createPlayer = function (uid, name, roleId,cb){
	var sql = 'insert into Player (uid,name,sex,coin,zuan,vipexp) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	//var role = dataApi.role.findById(roleId);
	var character = dataApi.character.findById(roleId);
  var role = {name: character.englishName, career: 'warrior', country: 1, gender: 'male'}
	var born = consts.BornPlace;
	var x = born.x + Math.floor(Math.random()*born.width);
	var y = born.y + Math.floor(Math.random()*born.height);
	var areaId = consts.PLAYER.initAreaId;
	//role.country = 1;
	var args = [uid, roleId, character.englishName, name, 1, 1, 1, 0, character.attackValue, character.defenceValue, character.hitRate, character.dodgeRate, character.walkSpeed, character.attackSpeed, character.hp, character.mp, character.hp, character.mp, areaId, x, y, 1];

	pomelo.app.get('dbclient').insert(sql, args, function(err,res){
		if(err !== null){
			logger.error('create player failed! ' + err.message);
			logger.error(err);
			utils.invokeCallback(cb,err.message, null);
		} else {
			var player = new Player({
				id: res.insertId,
				userId: uid,
				kindId: roleId,
				kindName: role.name,
				areaId: 1,
				roleName: name,
				rank: 1,
				level: 1,
				experience: 0,
				attackValue: character.attackValue,
				defenceValue: character.defenceValue,
				skillPoint: 1,
				hitRate: character.hitRate,
				dodgeRate: character.dodgeRate,
				walkSpeed: character.walkSpeed,
				attackSpeed: character.attackSpeed,
				equipments: {},
				bag: null
			});
			utils.invokeCallback(cb,null,player);
		}
	});
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function (player, cb){
	var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ? , maxHp = ?, maxMp = ?, country = ?, rank = ?, level = ?, experience = ?, areaId = ?, attackValue = ?, defenceValue = ?, walkSpeed = ?, attackSpeed = ? , skillPoint = ? where id = ?';
	var args = [player.x, player.y, player.hp, player.mp, player.maxHp, player.maxMp, player.country, player.rank, player.level, player.experience, player.areaId, player.attackValue, player.defenceValue, player.walkSpeed, player.attackSpeed, player.skillPoint, player.id];

	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};

/**
 * Delete player
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
userDao.deletePlayer = function (playerId, cb){
	var sql = 'delete from	Player where id = ?';
	var args = [playerId];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};
