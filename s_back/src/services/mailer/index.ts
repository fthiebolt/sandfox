import { Transporter, createTransport } from "nodemailer";
import { IUser, IUserVerificationToken } from "../../interfaces/user";
import { compile } from "ejs";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * @class Mailer
 * @description used for User verif and mails alerts
 * @todo update .ejs ...
 */
export class Mailer {
	public transporter: Transporter;
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
        
		this.transporter = createTransport({
			service: 'gmail',
			auth: {
				user: String(process.env.GM_USER), //user: 'galgool97@gmail.com',
				pass: String(process.env.GM_PASS) //pass: 'tempPass12345'
			}
		});
       
	}

	private send(toEmail: string, toName: string = '', subject: string, message: string) {
		console.log("EMAIL SENT TO : " + toEmail)
		return this.transporter.sendMail({
			from: 'SandFox <neOCampus.univ-tlse3.fr>',
			to: `${toName} <${toEmail}>`,
			subject,
			html: message
		})
	}
	public sendVerification(confirmationPath:string, user:IUser, token: IUserVerificationToken){
		const htmlMessage = compile(readFileSync(join(__dirname,'templates','user_verification.ejs'),{encoding:'utf-8'}))
		return this.send(user.email,`${user.first_name} ${user.last_name}`,
			'Vérification du compte', htmlMessage({confirmationPath,user, token}));
	}
	public sendResetPassword(user:IUser, token: IUserVerificationToken){
		const htmlMessage = compile(readFileSync(join(__dirname,'templates','password_reset.ejs'),{encoding:'utf-8'}))
		return this.send(user.email,`${user.first_name} ${user.last_name}`,
			'Reinstallation de mot de passe', htmlMessage({user, token}));
	}
	public sendAlert(user:IUser){
		const htmlMessage = compile(readFileSync(join(__dirname,'templates','alert.ejs'),{encoding:'utf-8'}))
		return this.send(user.email,`${user.first_name} ${user.last_name}`,
			'Alerte de consommation energetique', htmlMessage({user}));
	}
}