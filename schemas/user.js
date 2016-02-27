var mongoose = require('mongoose');
//install error
var bcrypt = require('bcrypt');
//replace bcrypt with bcrypt-nodejs
//var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

UserSchema.pre('save', function (next) {
	var user = this;

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}

		//因为bcrypt模块安装出错，用bcrypt-nodejs代替，所以下面的hash算法也被替代
		bcrypt.hash(user.password, salt, function (err, newHash) {
			if (err) {
				return next(err);
			}
			user.password = newHash;

			next();
		});
	});

	// bcrypt.hash(user.password, null, null, function (err, newHash) {
	// 	if (err) {
	// 		return next(err);
	// 	}
	// 	user.password = newHash;

	// 	next();
	// });
});


UserSchema.methods = {
	comparePassword: function (_password, callback) {
		bcrypt.compare(_password, this.password, function (err, isMatch) {
			if (err) {
				return callback(err);
			}

			callback(null, isMatch);
		});
	}
};


UserSchema.statics = {
	fetch: function (callback) {
		return this.find({}).sort('meta.updateAt').exec(callback);
	},
	findById: function (id, callback) {
		return this.findOne({_id: id}).exec(callback);
	}
}

module.exports = UserSchema;