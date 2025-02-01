const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.name = user.name;
    this.to = 'shanmukh0908@gmail.com';
    this.from = 'shanmukh <shanmukhmente@gmail.com>';
    this.url = url;
  }

  newtransporter() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_TRAPHOST,
      port: process.env.MAIL_TRAPPORT,
      auth: {
        user: '0e7b388a950a47',
        pass: 'a3e0fbc258e62e',
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      name: this.name,
      url: this.url,
      subject,
    });

    const emailoptions = {
      from: 'shanmukh <shanmukhmente@gmail.com>',
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newtransporter().sendMail(emailoptions);
  }

  async sendwelcomemail() {
    await this.send('welcome', 'welcome to the natours family');
  }

  async sendpasswordresetmail() {
    await this.send(
      'passwordtoken',
      'reset password token valid for 10 mins only',
    );
  }
};

// const sendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_TRAPHOST,
//     port: process.env.MAIL_TRAPPORT,
//     auth: {
//       user: 'dcda485d9029fe',
//       pass: '9dfdaaba40ee92',
//     },
//   });

//   const emailoptions = {
//     from: 'shanmukh <shanmukhmente@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(emailoptions);
// };

// module.exports = sendMail;
