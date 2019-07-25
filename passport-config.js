const localStrategy =  require("passport-local").Strategy
const bcrypt = require("bcrypt")

function initialize(passport , getUser , getUserbyId){
    const authenticateUser = async (email , password , done)=>{
        const user = getUser(email)
        if(user==null){
            return done(null , false , {message : "User Not Found"})
        }
        try{
            if(await bcrypt.compare(password , user.password)){
                return done(null,user)
            }
            else{
                return done(null ,false, {message : "Wrong Password"})
            }

        }
        catch(e){
            return done(e)

        }

    }
    passport.use(new localStrategy({usernameField : 'email'}, authenticateUser))

    passport.serializeUser((user,done) => done(null,user.id))
    passport.deserializeUser((id,done)=>{
        return done(null ,getUserbyId(id))}) 
}

module.exports = initialize