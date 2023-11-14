const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

// ** Sendgrid transporter
// const transporter = nodemailer.createTransport({
//   service: "SendGrid",
//   auth: {
//     user: process.env.SENDGRID_USERNAME,
//     pass: process.env.SENDGRID_PASSWORD,
//   },
// });

// ** sendinblue transporter
// const transporter = nodemailer.createTransport({
//   service: "SendinBlue",
//   auth: {
//     user: process.env.SENDINBLUE_USERNAME,
//     pass: process.env.SENDINBLUE_KEY,
//   },
// });
