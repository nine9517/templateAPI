const User = require('../models/user');
const Rig = require('../models/rig');
const cacheClient = {};

module.exports = function(io) {
 io.on('connection', function(client){
	var clientIp = client.request.connection.remoteAddress.split(":").pop();
	var rigCon;
	var userCon;
	var online = false;
	var rigConStatus = false;
	var tokenClient;
	
	client.on('setToken', function(data){
		tokenClient=data;
		if(typeof(cacheClient[tokenClient]) != "undefined"){
			clearInterval(cacheClient[tokenClient]);
		}
  	});
	client.on('rig', function(data){
		Rig.findById(data, function (err, rig) {
	  		if (err) return handleError(err);
	  		rigCon = rig;
	  		rig.status = 1;
	  		rig.save();
	  		console.log(rig.name+" connection, ip => "+clientIp);
	  		io.to(userCon._id).emit('reload', rig.name+" connection, ip => "+clientIp);
	  		rigConStatus = true;
		});
  	});
  	client.on('setRig', function(data){
		Rig.findById(data, function (err, rig) {
	  		if (err) return handleError(err);
	  		rigCon = rig;
	  		rig.status = 1;
	  		rig.save();
	  		if(!rigConStatus){
				console.log(rig.name+" connection, ip => "+clientIp);
				rigConStatus = true;
			}
		});
  	});
  	client.on('setUser', function(data){
		User.findById(data, function (err, user) {
	  		if (err) return handleError(err);
	  		userCon = user;
	  		client.join(data);
	  		if(!online){
				console.log(userCon.username+" online, Client Token => "+tokenClient);
				online = true;
			}
		});
  	});
  	client.on('user', function(data){
		User.findById(data, function (err, user) {
	  		if (err) return handleError(err);
	  		userCon = user;
	  		client.join(data);
	  		io.to(data).emit('status', new Date().getTime());
	  		console.log(userCon.username+" online, Client Token => "+tokenClient);
	  		online=true;
		});
  	});
  client.on('updateData', function(data){
  	var rigData = JSON.parse(data);
	rigCon.GPUdata=rigData;
	rigCon.save();

  });
  client.on('addRIG', function(data){
	const newRIG = new Rig({ name : data , _userID : userCon._id ,status:0 });
	newRIG.save();
	io.to(userCon._id).emit('reload', " add RIG => "+data);
  });
  client.on('delRIG', function(data){
	Rig.deleteOne({ _id: data}, function (err) {
  				if (err) return handleError(err);
  				io.to(userCon._id).emit('reload', " delete success ");
			});
	
  });
  client.on('updateName', function(data){
  	var rigEdit = JSON.parse(data);
  	Rig.findById(rigEdit.id, function (err, rig) {
	  		if (err) return handleError(err);
	  		var oldName = rig.name;
	  		console.log(oldName+" change => "+rigEdit.name);
	  		rig.name = rigEdit.name
	  		rig.save();
	  		io.to(userCon._id).emit('reload', oldName+" change => "+rigEdit.name);
		});
	
  });
  client.on('disconnectRIG', function(data){
  	rigCon.status = 0;
  	rigCon.save();
  	console.log(rigCon.name+" disconnect");
  	io.to(userCon._id).emit('reload', rigCon.name+" disconnect");
  	rigCon = undefined;
  });
  client.on('disconnect', function(){
  	cacheClient[tokenClient] = setInterval(function() {
  		if (typeof(rigCon) != "undefined"){
	  		rigCon.status = 0;
	  		rigCon.save();
	  		console.log(rigCon.name+" disconnect");
	  		io.to(userCon._id).emit('reload', rigCon.name+" disconnect");
	  	}
	  	console.log(userCon.username+" ofline, Client Token => "+tokenClient);
	  	online=false;
	  	clearInterval(cacheClient[tokenClient]);
	  	delete cacheClient[tokenClient];
  	}, 6000);
  });
});

};