const JWT = require('jsonwebtoken');
const User = require('../models/user');
const RIG = require('../models/rig');
const { JWT_SECRET } = require('../configuration');
const bcrypt = require('bcryptjs');
const modelHelpers = require('../helpers/modelHelpers');
const mongoose =  require('mongoose');
const Schema = mongoose.Schema;
signToken = (user) => {
	return JWT.sign({
		iss: '9Develop',
		token: user.id,
		type:"A",
		iat: new Date().getTime(),
		exp: new Date().setDate(new Date().getDate() + 1)
	},JWT_SECRET);
}
refreshToken = async (user) => {
	const tk = await bcrypt.hashSync(user.id+""+Date.now());
	User.findById(user.id, function (err, user) {
	  if (err) return handleError(err);
	  user.refresh_token.push(tk);
	  user.save();
	});

	return JWT.sign({
		iss: '9Develop',
		token: user.id,
		tokenR: tk,
		type:"R",
		iat: new Date().getTime(),
		exp: new Date().setDate(new Date().getDate() + 7)
	},JWT_SECRET);
}
module.exports = {
	register: async (req, res, next) => {
		const { username, password, email } = req.value.body;
		const foundUser = await User.findOne({ username });
		if(foundUser){
			return res.status(403).json({ error:'Username is already in use' });
		}
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(req.value.body.password,salt);
		const newUser = new User({
			username:req.value.body.username, 
			password:passwordHash, 
			email:req.value.body.email
		});
		await newUser.save();
		const token = signToken(newUser);
		const Rtoken = await refreshToken(newUser);
		//res.status(200).json({token});
		res.status(200).json({
			access_token : token,
			refresh_token : Rtoken
		});
	},
	login: async (req, res, next) => {
		const token = signToken(req.user);
		const Rtoken = await refreshToken(req.user);
		res.status(200).json({
			access_token : token,
			refresh_token : Rtoken
		});
	},
	getData: async (req, res, next) => {
		if(req.user.typeToken=="A"){
			res.status(200).json({
				data : modelHelpers.userHideAttribute(req.user)
			});
		}else{
			res.status(401).send("Unauthorized");
		}
		
	},
	refresh: async (req, res, next) => {
		if(req.user.typeToken=="R"){
			const token = signToken(req.user);
			const Rtoken = await refreshToken(req.user);
			res.status(200).json({
				access_token : token,
				refresh_token : Rtoken
			});
		}else{
			res.status(401).send("Unauthorized");
		}
	},
	addRIG: async (req, res, next) => {
		if(req.user.typeToken=="A"){
			
			const newRIG = new RIG({ name : req.body.name , _userID : req.user.id ,status:0 });
			await newRIG.save();
			res.status(200).json({
				status : 0,
				detail : "success"
			});
		}else{
			res.status(401).send("Unauthorized");
		}
	},
	delRIG: async (req, res, next) => {
		if(req.user.typeToken=="A"){
			RIG.deleteOne({ _id: req.body.id}, function (err) {
  				if (err) return handleError(err);
			});
			
			res.status(200).json({
				status : 0,
				detail : "success"
			});
		}else{
			res.status(401).send("Unauthorized");
		}
	},
	getRIG: async (req, res, next) => {
		if(req.user.typeToken=="A"){
			const rigs = await RIG.find({ _userID : req.user.id });
			res.status(200).json({
				status : 0,
				data : rigs
			});
		}else{
			res.status(401).send("Unauthorized");
		}
	},
	updateRIG: async (req, res, next) => {
		if(req.user.typeToken=="A"){
			const rig = await RIG.findOne({ _id:req.body.id,_userID:req.user.id });
			rig.name=req.body.name;
	  		rig.save();
			res.status(200).json({
				status : 0,
				detail : "success"
			});
		}else{
			res.status(401).send("Unauthorized");
		}
	}

}