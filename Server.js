const express=require('express')
const UserModel=require('./models/User')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const app =express();
const path=require('path')
const IpAddress = require('./models/IP');
require('dotenv').config();


const PORT=process.env.PORT ;
const SECRET_KEY=process.env.SECRET_KEY;

// Form Handler
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,'public')))
// View Engine 
app.set("view engine","ejs")

// Middleware to get the client's IP address
app.use((req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    req.clientIp = forwarded ? forwarded.split(',').shift() : req.connection.remoteAddress;
    next();
  });

  const Genere=[
    {id:1,name:"Action"},
    {id:2,name:"Horror"},
    {id:3,name:"Crime"}]  
  // Grab IP Route
app.get('/api/grabip', async(req, res) => {
    try {
      // Save IP address to the database
      const newIpAddress = new IpAddress({ ip: req.clientIp });
      await newIpAddress.save();
  
      // Render the EJS page
      res.render('Ip', { ip: req.clientIp });
    } catch (err) {
      console.error('Error saving IP address to database', err);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/',(req,res)=>{
    res.render('Index')
})
app.get('/api/getgeneres',(req,res)=>{
    res.send(Genere)
})
app.post('/api/creategenere',(req,res)=>{
    const creaetedgenere={
        id:Genere.length+1,
        name:req.body.name,
    }
    Genere.push(creaetedgenere)
    res.send(creaetedgenere)
})
app.delete('/api/deletegenere/:id',(req,res)=>{

    const genre = Genere.find(c => c.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('The genre with the given ID was not found.');

    const index = Genere.indexOf(genre);
    Genere.splice(index, 1);

  res.send(genre);
})
app.put('/api/updategenere/:id',(req,res)=>{
    const find=Genere.find(f=>f.id == req.params.id)
    if(!find) return res.status(404).send("Wrong ID Entered")
    
     find.name=req.body.name
    res.send(find)
})
app.get('/api/login',(req,res)=>{
    res.render('Login')
})
app.get('/api/register', (req,res)=>{
   res.render('Register') 
})
app.post('/api/register',async (req,res)=>{
  let {Username,Email,Password}=req.body;
   bcrypt.genSalt(10,async function(err,salt){
    bcrypt.hash(Password,salt, async function(err,hash){
        let createdUser=await UserModel.create({
           Username,
           Password:hash,
           Email
        })
    const token=jwt.sign({Email:req.body.Email,Username:req.body.Username},SECRET_KEY)
    res.cookie("token",token)
    res.redirect('/api/profile')
      
    })
   }) 
})
app.post('/api/login', async (req, res) => {
    const { Email, Password } = req.body;
    const user = await UserModel.findOne({ Email });
    if (!user) {
       return res.status(404).send("User Not Found");
    }
    bcrypt.compare(Password, user.Password, (err, result) => {
       if (result) {
        const token=jwt.sign({Email:req.body.Email,Username:req.body.Username},SECRET_KEY)
    res.cookie("token",token)
          return res.redirect('/api/profile')
       } else {
          return res.status(404).send("User Not Found");
       }
    });
 });
app.get('/api/logout',(req,res)=>{
    res.cookie("token","")
    res.redirect('/api/login')
})
app.get('/api/profile', isLoggedIn, (req, res) => {
    res.render('Profile', { user: req.user });
});

function isLoggedIn(req,res,next){
    if(req.cookies.token===""){
        return res.redirect('/api/login')
    }
    else{
        const data=jwt.verify(req.cookies.token,SECRET_KEY)
        req.user=data;
        next();
    }

}



app.listen(PORT,()=>{
    console.log(`Server Running on http://localhost:${PORT}/ `)
})