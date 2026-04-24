const transporter= require( "../config/mail.js");
const sendEmail = async (options) => {
 await transporter.sendMail({
   from: `"Mon App" <${process.env.SMTP_USER}>`,
   to: options.email,
   subject: options.subject,
   html: options.message,
 });
};

module.exports = sendEmail;
