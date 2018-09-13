const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const { JWT_SECRET } = require('./configuration');
const User = require('./models/user');

passport.use(new JwtStrategy({
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: JWT_SECRET
},async (payload,done) => {
	try{
		if(payload.iss=='9Develop' && payload.exp>(new Date().getTime())){
			const user = await User.findById(payload.token);

			if(!user){
				return done(null,false);
			}

			if(payload.type == "R"){
				if(user.refresh_token.indexOf(payload.tokenR)>-1){
					user.refresh_token.pull(payload.tokenR);
					user.save();
				}else{
					return done(null,false);
				}
			}

			user.typeToken = payload.type;
			done(null,user);
		}else{
			return done(null,false);
		}
	}catch(error){
		done(error,false);
	}
}));

passport.use(new LocalStrategy({
	usernameField: 'username'
},async (username,password,done)=>{
		const user = await User.findOne({ username });

		if(!user){
			//console.log("user not found");
			return done(null,false);
		}

		const isMatch = await user.isValidPassword(password);

		if(!isMatch){
			//console.log("password not match");
			return done(null,false);
		}
		//console.log(user);
		done(null, user);
}));