const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "",
        pass: "",
    },
});
//http://localhost:3000/api/v1/auth/resetpassword/a87edf6812f235e997c7b751422e6b2f5cd95aa994c55ebeeb931ca67214d645

// Send an email using async/await;
module.exports = {
    sendMail: async function (to,url) {
        const info = await transporter.sendMail({
            from: 'admin@hehehe.com',
            to: to,
            subject: "reset pass",
            text: "click vo day de doi pass", // Plain-text version of the message
            html: "click vo <a href="+url+">day</a> de doi pass", // HTML version of the message
        });
    },
    sendAccountPasswordMail: async function (to, username, password) {
        await transporter.sendMail({
            from: 'admin@hehehe.com',
            to: to,
            subject: 'tai khoan moi',
            text: 'Tai khoan cua ban da duoc tao. Username: ' + username + ' - Password: ' + password,
            html: '<p>Tai khoan cua ban da duoc tao.</p><p>Username: <b>' + username + '</b></p><p>Password: <b>' + password + '</b></p>'
        });
    }
}