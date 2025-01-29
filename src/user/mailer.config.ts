import { MailerOptions } from "@nestjs-modules/mailer";
import 'dotenv/config';

export const mailerConfig: MailerOptions = {
    transport:{
        host:process.env.GMAIL_SMTP,
        port:587,
        secure:false,
        auth:{
            user:process.env.GMAIL_USER,
            pass:process.env.GMAIL_PASS
        },
        tls:{
            rejectUnauthorized: false
        }
    },
}
