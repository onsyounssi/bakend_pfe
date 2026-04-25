const transporter = require("../config/mail.js");

async function sendPasswordResetEmail(to, resetUrl) {
  // On utilise l'email configuré dans le transporteur pour éviter les erreurs d'authentification
  const senderEmail = process.env.SMTP_USER || "noreply@smartbabycare.com";

  return await transporter.sendMail({
    from: `"SmartBabyCare" <${senderEmail}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ec4899; text-align: center;">SmartBabyCare</h2>
        <p>Bonjour,</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valide 1 heure) :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #ec4899; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
