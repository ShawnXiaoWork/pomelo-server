/**
 *Module dependencies
 */

/**
 * Initialize a new 'User' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 */

var User = function(opts){
	this.id = opts.id;
	this.nickname = opts.nickname
	this.sex = opts.sex
	this.photo = opts.photo
	this.coin = opts.coin
	this.zuan = opts.zuan
	this.signature = opts.signature
	this.contect = opts.contect
	this.vipExp = opts.vipExp
};

/**
 * Expose 'Entity' constructor
 */
module.exports = User;
