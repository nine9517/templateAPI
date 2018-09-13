module.exports = {
	userHideAttribute: (user) => {
		user.refresh_token = undefined;
		user.password = undefined;
		user.__v = undefined;
		return user;
	}
}