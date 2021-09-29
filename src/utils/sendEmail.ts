import nodemailer from 'nodemailer'

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, html: string) {

  //let testAccount = await nodemailer.createTestAccount();
  //console.log("testAcc: ", testAccount)

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.ezli.ro",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
    await transporter.sendMail({
        from: `"📝 Todos" <${process.env.EMAIL_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
    });

}