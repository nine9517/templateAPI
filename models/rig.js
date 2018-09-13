const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const rigSchema = new Schema({
	name : String,
	_userID : Schema.ObjectId,
	GPUdata : [
                {
                    name: String,
                    temp: Number,
                    ram: {
                        Total: Number,
                        Used: Number,
                        Free: Number
                    }
                }
 			],
	status : Number
}, { 
	timestamps: { 
		createdAt: 'create_at' ,
		updatedAt: 'update_at'
	}
});

const Rig = mongoose.model('rig',rigSchema,'rig');

module.exports = Rig;