"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
const nodemailer_1 = require("nodemailer");
const ejs_1 = require("ejs");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * @class Mailer
 * @description used for User verif and mails alerts
 * @todo update .ejs ...
 */
class Mailer {
    constructor() {
        //SMTP SERVER OR GOOGLE ACCOUNT
        // SMTP SERVER
        // this.transporter = createTransport({
        //     pool: true,
        //     host: "smtp.example.com",
        //     port: 465,
        //     secure: true, // use TLS
        //     auth: {
        //         user: "username",
        //         pass: "password"
        //     }
        // });
        // GOOGLE Account
        this.transporter = nodemailer_1.createTransport({
            service: 'gmail',
            auth: {
                user: String(process.env.GM_USER),
                pass: String(process.env.GM_PASS) //pass: 'tempPass12345'
            }
        });
    }
    send(toEmail, toName = '', subject, message) {
        console.log("EMAIL SENT TO : " + toEmail);
        return this.transporter.sendMail({
            from: 'SandFox <neOCampus.univ-tlse3.fr>',
            to: `${toName} <${toEmail}>`,
            subject,
            html: message
        });
    }
    sendVerification(confirmationPath, user, token) {
        const htmlMessage = ejs_1.compile(fs_1.readFileSync(path_1.join(__dirname, 'templates', 'user_verification.ejs'), { encoding: 'utf-8' }));
        return this.send(user.email, `${user.first_name} ${user.last_name}`, 'Vérification du compte', htmlMessage({ confirmationPath, user, token }));
    }
    sendResetPassword(user, token) {
        const htmlMessage = ejs_1.compile(fs_1.readFileSync(path_1.join(__dirname, 'templates', 'password_reset.ejs'), { encoding: 'utf-8' }));
        return this.send(user.email, `${user.first_name} ${user.last_name}`, 'Reinstallation de mot de passe', htmlMessage({ user, token }));
    }
    sendAlert(user) {
        const htmlMessage = ejs_1.compile(fs_1.readFileSync(path_1.join(__dirname, 'templates', 'alert.ejs'), { encoding: 'utf-8' }));
        return this.send(user.email, `${user.first_name} ${user.last_name}`, 'Alerte de consommation energetique', htmlMessage({ user }));
    }
}
exports.Mailer = Mailer;
