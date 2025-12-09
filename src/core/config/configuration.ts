export default () => ({
  // port: parseInt(process.env.PORT, 10) || 3000,
  sendMail: {
    authMail: process.env.GMAIL_USER,
    authPass: process.env.PASS_SMTP,
  },
});
