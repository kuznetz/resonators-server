import nodemailer from 'nodemailer';
import cfg from '../cfg';

export default function sendResonatorEmail({from = 'mindharmoniesinc app', to, cc, subject, html}) {
    if (process.env.ENV !== 'production')
        return Promise.resolve();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: cfg.email.username,
            pass: cfg.email.password
        }
    });

    let mailOptions = {
        from,
        to,
        subject,
        html
    };

    if (cc)
        mailOptions.cc = cc;

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return reject(error);
            }

            resolve();
        });
    });
}
