const express=require('express')
const mongoose=require('mongoose')
const app=express()
const CategorieRouter=require("./routes/categorie.route")
const scategorieRouter = require("./routes/scategorie.route")
const articleRouter =require("./routes/article.route")
const chatbotRouter=require("./routes/chatbot.route")
const dotenv=require("dotenv")
app.use(express.json())
dotenv.config()

app.get('/',(req,res)=>{
    res.send("bienvenue dans notre site")
})
//connection base de donnée
mongoose.connect(process.env.DATABASECLOUD)
.then(()=>{console.log("connection a la base de données reussie")})
.catch((Error)=>{console.log("impossible de se connecter al la base de données",Error)
    process.exit()
})
app.use("/api/categories",CategorieRouter)
app.use('/api/scategories', scategorieRouter)
app.use('/api/articles', articleRouter);
app.use("/api/chat",chatbotRouter);
app.listen(process.env.PORT,function(){
    console.log("serveur is listen on port 4000")
})
module.exports=app;
