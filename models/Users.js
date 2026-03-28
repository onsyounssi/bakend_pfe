// models/Users.js 
const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
    fullName: {
        type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true 
    },
      phone:{
        type: String,
        required: [true, 'Le téléphone est requis'],
        unique: true,
        trim: true
    },
    email: { 
        type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide']
    },
    password:{
         type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6},
    image: { type: String },  

    role: {
        type: String,
        required: [true, 'Le rôle est requis'],
        enum: ['parent', 'babysitter','admin'],
            default: 'parent'},
    acceptTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  resetPasswordToken: String,
   resetPasswordExpire: Date
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);