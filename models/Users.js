// models/Users.js 
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
    {
        lastName: {
            type: String,
            required: [true, 'Le nom complet est requis'],
            trim: true
        },
        firstName: {
            type: String,
            required: [true, 'Le prénom est requis'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Le téléphone est requis'],
            unique: true,
            trim: true,
            // On s'assure que c'est bien 8 chiffres (sans compter le préfixe si présent)
            validate: {
                validator: function (v) {
                    // Supprime le préfixe pour vérifier la longueur utile
                    const cleanNumber = v.replace(/^(?:\+216|00216)/, '');
                    return /^[24579]\d{7}$/.test(cleanNumber);
                },
                message: props => `${props.value} n'est pas un numéro tunisien valide !`
            }
        },
        email: {
            type: String,
            required: [true, 'L\'email est requis'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide']
        },
        password: {
            type: String,
            required: [true, 'Le mot de passe est requis'],
            minlength: 6
        },
        image: { type: String },

        role: {
            type: String,
            required: [true, 'Le rôle est requis'],
            enum: ['parente', 'baby-sitter', 'admin'],
            default: 'parente'
        },
        acceptTerms: {
            type: Boolean,
            required: true,
            default: false
        },

         passwordResetToken: { type: String, select: false },
         passwordResetExpires: { type: Date },


    }, { timestamps: true });

    // hash password
    UserSchema.pre("save", async function (next) {
     if (!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password, 10);
     next();
     });



module.exports = mongoose.model("User", UserSchema);