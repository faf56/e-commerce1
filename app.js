const express=require('express')
const mongoose=require('mongoose')
const dotenv=require("dotenv")
const cors=require("cors")
const path = require('path');
const app=express()
const CategorieRouter=require("./routes/categorie.route")
const scategorieRouter = require("./routes/scategorie.route")
const articleRouter =require("./routes/article.route")
const chatbotRouter=require("./routes/chatbot.route")
const userRouter =require("./routes/user.route")
const chatbotRequeteRouter = require("./routes/chatbot-requete.route")
const paymentRouter =require("./routes/payement.route.js");

app.use(express.json())
app.use(cors())
dotenv.config()
/*
app.get('/',(req,res)=>{
    res.send("bienvenue dans notre site")
})
*/
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
app.use('/api/users', userRouter);
app.use('/api/chatbot', chatbotRequeteRouter);
app.use('/api/payment', paymentRouter);

//dist reactjs
app.use(express.static(path.join(__dirname, './client/build'))); // Route pourles pages non trouvées, redirige vers index.html
app.get('*', (req, res) => { res.sendFile(path.join(__dirname,
'./client/build/index.html')); });

// serveur
app.listen(process.env.PORT,function(){
    console.log("serveur is listen on port 4000")
})
module.exports=app;
