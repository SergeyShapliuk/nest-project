export default () => ({
  // port: parseInt(process.env.PORT, 10) || 3000,
  sendGrid: process.env.SENDGRID_API_KEY,
  sendMail: {
    authMail: process.env.GMAIL_USER,
    authPass: process.env.PASS_SMTP,

    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM_EMAIL,
    name: process.env.SMTP_FROM_NAME,
  },
});
