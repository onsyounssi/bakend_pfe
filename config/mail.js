const nodemailer = require("nodemailer");

let transporter;

const isPlaceholder = !process.env.SMTP_PASS || 
                     process.env.SMTP_PASS === "Yo123456" || 
                     process.env.SMTP_PASS.includes("votre-mot-de-passe");

if (isPlaceholder) {
  console.log("⚠️ SMTP non configuré. Utilisation du compte de test Ethereal...");
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'trevor.lang83@ethereal.email',
      pass: 'C451FndvQ5z8D1FwHh'
    }
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = transporter;
