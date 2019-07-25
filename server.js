const express = require("express");
const app = express();
const bcrypt = require("bcrypt")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const initializePassport = require("./passport-config")



const users = []

initializePassport(passport , 
    email=>users.find(user=> user.email === email),
    id => users.find(user=>user.id===id)
)

app.set('view-engine' , 'ejs')

app.use(express.urlencoded({
    extended : false
}))
app.use(flash())
app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.get("/", (req ,res)=>{
    if (req.isAuthenticated()) {
    res.render("index.ejs" , {name : req.user.name , button_visible:true})
        
    } else {
    res.render("index.ejs" , {name : "Please Log IN" , button_visible : false})
        
    }
})

app.get("/login",checkUnAuthenticated, (req ,res)=>{
    res.render("login.ejs")
})
app.post("/login", passport.authenticate('local', {
    successRedirect : './',
    failureRedirect : './login',
    failureFlash:true
}))

app.delete("/logout" , (req,res)=>{
    req.logOut();
    res.redirect('/')
})

app.get("/register", checkUnAuthenticated, (req ,res)=>{
    res.render("register.ejs")
})

app.post("/register",async (req,res)=>{
    try {
        const hashedPassword =await bcrypt.hash(req.body.password , 10)
        users.push({
            id : Date.now().toString(),
            name  : req.body.name,
            email : req.body.email,
            password : hashedPassword
        })
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
    console.log(users);
    
})

function checkAuthenticated(req ,res , next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
function checkUnAuthenticated(req,res,next){
    if(!req.isAuthenticated()){
        next()
    }
    else{
        res.redirect("/")
    }
}


app.listen(3000)