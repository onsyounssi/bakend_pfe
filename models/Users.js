// models/Users.js 
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
    nom: {
        type: String,
        required: true 
    },
    email: { type: String, unique: true },
    password:{
        type: String},
    image: { type: String },  

    role: {
        type: String, enum: ['parent', 'sitter', 'admin'],
            default: 'parent'},
    adresse:{
        type: String
    },
    
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);