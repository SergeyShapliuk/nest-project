export default () => ({
  // port: parseInt(process.env.PORT, 10) || 3000,
  sendGrid: process.env.SENDGRID_API_KEY,
  sendMail: {
    authMail: process.env.GMAIL_USER,
    authPass: process.env.PASS_SMTP,


  },
});
