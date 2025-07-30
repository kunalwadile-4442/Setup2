import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true = SSL
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, 
    },
  });

  console.log("process.env.MAIL_USER",process.env.MAIL_USER)
  console.log("process.env.MAIL_PASS",process.env.MAIL_PASS)

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};
