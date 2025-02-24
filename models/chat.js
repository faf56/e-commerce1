const { response } = require("express")
const mongoose = require("mongoose")
const { text } = require("motion/react-client")
const MessageSchema = new mongoose.Schema({
    text: String,
    response: String
});
module.exports= mongoose.model("Message",MessageSchema)