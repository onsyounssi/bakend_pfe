const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- TEST DE CONFIGURATION SMTP ---');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '******** (défini)' : 'NON DÉFINI');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testConnection() {
  try {
    await transporter.verify();
    console.log('✅ SUCCÈS : Le serveur SMTP est prêt !');
  } catch (error) {
    console.error('❌ ÉCHEC : Erreur de connexion SMTP.');
    console.error('Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('CONSEIL : Votre email ou votre mot de passe d\'application est incorrect.');
    }
  }
}

testConnection();
