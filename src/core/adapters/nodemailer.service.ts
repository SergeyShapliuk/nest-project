// import nodemailer from 'nodemailer';
//
// export const nodemailerService = {
//   async sendEmail(
//     email: string,
//     code: string,
//     template: (code: string) => string,
//   ): Promise<boolean> {
//     console.log('email', email);
//     console.log('GMAIL_USER', process.env.GMAIL_USER);
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         // type: "OAuth2",
//         user: process.env.GMAIL_USER,
//         pass: process.env.PASS_SMTP ?? 'aowz abrx gvvw ctew',
//         // clientId: process.env.GMAIL_CLIENT_ID,
//         // clientSecret: process.env.GMAIL_CLIENT_SECRET,
//         // refreshToken: process.env.GMAIL_REFRESH_TOKEN,
//         // accessToken: process.env.GMAIL_ACCESS_TOKEN
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//       // logger: true, // Log to console
//       // debug: true // Include SMTP traffic in the logs
//     });
//     await transporter.verify();
//     console.log('Server is ready to take our messages');
//     const info = await transporter.sendMail({
//       from: `\"Kek 👻\" <${process.env.GMAIL_USER}>`,
//       to: email,
//       subject: 'Your code is here',
//       html: template(code), // html body
//     });
//     console.log('info', !!info);
//     return !!info;
//   },
// };
