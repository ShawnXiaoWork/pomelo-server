var Account = function(opts) {
	this.id = opts.id;
	this.nickname = opts.nickname;
	this.identifier = opts.identifier
	this.unionid = opts.unionid
	this.system = opts.system
	this.pv = opts.pv
	this.netmode = opts.netmode
	this.phone = opts.phone
	this.versionName = opts.versionName
	this.versionCode = opts.versionCode
	this.passwd = opts.passwd
	this.lastLoginTime = opts.lastLoginTime;
};

module.exports = Account;