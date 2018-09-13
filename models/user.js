const mongoose =  require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

const userSchema = new Schema({
	username : {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	password : {
		type: String,
		required: true
	},
	email : {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	refresh_token : [String]
}, { 
	timestamps: { 
		createdAt: 'create_at' ,
		updatedAt: 'update_at'
	}
});

// userSchema.pre('save', async function(next) {
// 	try{
// 		const salt = await bcrypt.genSalt(10);
// 		const passwordHash = await bcrypt.hash(this.password,salt);
// 		this.password = passwordHash;
// 		next();
// 	}catch(error){
// 		next(error);
// 	}
// });

userSchema.methods.isValidPassword = async function(newPassword) {
	try{
		return await bcrypt.compare(newPassword,this.password);
	} catch(error) {
		throw new Error(error);
	}
}

const User = mongoose.model('user',userSchema,'member');

module.exports = User;