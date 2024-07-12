require('dotenv').config();
const DATABASE_URL=process.env.DATABASE_URL;

const mongoose =require('mongoose')
mongoose.connect(DATABASE_URL)
const UserSchema=mongoose.Schema({
    Username:String,
    Email:String,
    Password:String,

})
module.exports=mongoose.model('Users',UserSchema)