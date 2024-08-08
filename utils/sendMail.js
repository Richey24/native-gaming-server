const nodemailer = require("nodemailer");
const formatedDate = require("./formatedDate");

const sendForgotPasswordEmail = (email, name, otp) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });

     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Reset Password",
          html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* CSS styles for the email template */
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
          }
          .highlight {
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
          .cta-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827" alt="Company Logo">
            <h1 style="color: #333333;">Reset Password Request</h1>
          </div>
          <div class="message">
            <p>Dear ${name},</p>
            <p>You requested to reset the password to your account.</p>
            <p>Click on the button below to reset your password</p>
          </div>
          <div class="message">
          <p>OTP: <strong>${otp}</strong></p>
            <p>Ignore this email if this was not requested by you.</p>
            <p>If you need any assistance, our dedicated support team is here to help. Contact us at [support email/phone number].</p>
          </div>
          <div class="footer">
            <p style="color: #777777;">This email was sent by Breaking Black Ventures, LLC. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Email sent: " + info.response);
               // do something useful
          }
     });
};

const sendOtp = (email, name, otp, type) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });
     let subject, introMessage;
     if (type === "vendor") {
          subject = "Native Gaming";
          introMessage = `      <p>We are thrilled to welcome you as a new vendor on our vibrant and dynamic Gaming platform.</p>
        <p>Here are some key benefits of joining our platform:</p>
        <ul>
          <li>Opportunity to create and customize your games.</li>
          <li>Full access to our suite of tools and features.</li>
          <li>Familiarize yourself with our user-friendly interface.</li>
          <li>Get access to emails and data of users that register under you</li>
        </ul>`;
     } else if (type === "client") {
          subject = "Native Gaming";
          introMessage = `<p>We are thrilled to welcome you as a new user on our vibrant and dynamic Gaming platform.</p>
   `;
     } else if (type === "admin") {
          subject = "Native Gaming";
          introMessage = `<p>We are thrilled to welcome you as an Admin on our vibrant and dynamic Gaming platform.</p>`;
     } else if (type === "participant") {
          subject = "Hops Contest";
          introMessage = `<p>We are thrilled to welcome you to Hops Contest</p>`;
     } else if (type === "convention") {
          subject = "Native Gaming";
          introMessage = `<p>Welcome back to your dashboard.</p>`;
     }
     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* CSS styles for the email template */
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
          }
          .highlight {
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
          .cta-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img class="logo" src="https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827" alt="Company Logo">
            <h1 style="color: #333333;">Welcome as a New ${
                 type === "vendor" ? "Vendor" : "Member"
            }!</h1>
          </div>
          <div class="message">
            <p>Dear ${name},</p>
            ${introMessage}
          </div>
          <div class="message">
            <p>Welcome aboard! If you have any questions or need further assistance, please do not hesitate to reach out to us. We are always here to help.</p>
            <p>${type !== "client" && "OTP:"} <strong>${type !== "client" && otp}</strong></p>
          </div>
          <div class="footer">
            <p style="color: #777777;">This email was sent by Breaking Black Ventures, LLC. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
          </div>
        </div>
      </body>
      </html>       
    `,
     };
     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Email sent: " + info);
               // do something useful
          }
     });
};

const sendAdminWelcomeMail = (email, name) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });
     let subject, introMessage;

     subject = `Welcome ${name} to ImarketPlace Admin Service - The Guardians of Our Digital Realm!`;
     introMessage = `
<p>We are thrilled to welcome you as a new admin member on our vibrant and dynamic Native Gaming site.</p>
`;

     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          html: `
<!DOCTYPE html>
<html>
<head>
<style>
  /* CSS styles for the email template */
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

  body {
    font-family: 'Montserrat', Arial, sans-serif;
    line-height: 1.6;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 5px;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .message {
    margin-bottom: 20px;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 5px;
  }
  .highlight {
    font-weight: bold;
  }
  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
  }
  .logo {
    display: block;
    margin: 0 auto;
    max-width: 200px;
  }
  .cta-button {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 5px;
  }
  .cta-button:hover {
    background-color: #0056b3;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img class="logo" src="https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827" alt="Company Logo">
  </div>
  <div class="message">
    <p>Dear ${name},</p>
    ${introMessage}
  </div>
  <div class="message">
    <p>Welcome aboard! If you have any questions or need further assistance, please do not hesitate to reach out to us. We are always here to help.</p>
  </div>
  <div class="footer">
    <p style="color: #777777;">This email was sent by Breaking Black Ventures, LLC. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
  </div>
</div>
</body>
</html>       
`,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Admin Welcome Email sent: " + info.response);
               // do something useful
          }
     });
};
const sendConventionCenterWelcomeMail = (email, name) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });
     let subject, introMessage;

     subject = `Welcome ${name} to Native Games`;
     introMessage = `
<p>We are thrilled to welcome you as a new member on our vibrant and dynamic Native Gaming site.</p>
`;

     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: subject,
          html: `
<!DOCTYPE html>
<html>
<head>
<style>
  /* CSS styles for the email template */
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

  body {
    font-family: 'Montserrat', Arial, sans-serif;
    line-height: 1.6;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 5px;
  }
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .message {
    margin-bottom: 20px;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 5px;
  }
  .highlight {
    font-weight: bold;
  }
  .footer {
    margin-top: 20px;
    text-align: center;
    font-size: 12px;
  }
  .logo {
    display: block;
    margin: 0 auto;
    max-width: 200px;
  }
  .cta-button {
    display: inline-block;
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 5px;
  }
  .cta-button:hover {
    background-color: #0056b3;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <img class="logo" src="https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827" alt="Company Logo">
  </div>
  <div class="message">
    <p>Dear ${name},</p>
    ${introMessage}
  </div>
  <div class="message">
    <p>Welcome aboard! If you have any questions or need further assistance, please do not hesitate to reach out to us. We are always here to help.</p>
  </div>
  <div class="footer">
    <p style="color: #777777;">This email was sent by Breaking Black Ventures, LLC. If you no longer wish to receive emails from us, please <a href="#" style="color: #777777; text-decoration: underline;">unsubscribe</a>.</p>
  </div>
</div>
</body>
</html>       
`,
     };

     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Admin Welcome Email sent: " + info.response);
               // do something useful
          }
     });
};

const sendCouponCode = (coupon, email, name) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });
     const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Coupon Code",
          html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* CSS styles for the email template */
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
          }
            .coupon {
            border: 5px dotted #bbb; /* Dotted border */
            width: 80%;
            border-radius: 15px; /* Rounded border */
            margin: 0 auto; /* Center the coupon */
            max-width: 600px;
          }

          .container {
          padding: 2px 16px;
          background-color: #f1f1f1;
          }

        .promo {
        background: #ccc;
        padding: 3px;
        }

        .expire {
        color: red;
        }
        .begin {
        color: green;
        }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
          }
          .highlight {
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="coupon">
          <div class="container">
              <h3>Coupon Mail for ${coupon.title}</h3>
          </div>
          <img src=${
               coupon.logo ??
               "https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827"
          } alt="Logo" style="width:100%;">
        <div class="container" style="background-color:white">
          <h2><b>GET ${coupon.percentageOff}% OFF YOUR PURCHASE</b></h2>
            <h5>Dear ${name},</h5>
            <p>${coupon.description}</p>
          </div>
        <div class="container">
          <p>Use Promo Code: <span class="promo">${coupon.code}</span></p>
           <p class="begin">Start: ${formatedDate(coupon.startDate)}</p>
          <p class="expire">Expires: ${formatedDate(coupon.expiryDate)}</p>
        </div>
      </div>
      </body>
      </html>
    `,
     };
     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Coupon mail sent: " + info.response);
               // do something useful
          }
     });
};
const sendWinningMessage = (user, client, reward) => {
     const transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          auth: {
               user: process.env.EMAIL,
               pass: process.env.PASSWORD,
          },
     });
     const mailOptions = {
          from: process.env.EMAIL,
          to: client.email,
          subject: "Congratulations",
          html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* CSS styles for the email template */
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

          body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
          }
            .coupon {
            border: 5px dotted #bbb; /* Dotted border */
            width: 80%;
            border-radius: 15px; /* Rounded border */
            margin: 0 auto; /* Center the coupon */
            max-width: 600px;
          }

          .container {
          padding: 2px 16px;
          background-color: #f1f1f1;
          }

        .promo {
        background: #ccc;
        padding: 3px;
        }

        .expire {
        color: red;
        }
        .begin {
        color: green;
        }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .message {
            margin-bottom: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
          }
          .highlight {
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="coupon">
          <div class="container">
              <h3>Congratulations!!!</h3>
          </div>
          <img src=${
               user.logo ??
               "https://absa7kzimnaf.blob.core.windows.net/newcontainer/4bd838367ba7342586fb35a34d837827"
          } alt="Logo" style="width:50px; height: 50px;">
        <div class="container" style="background-color:white">
            <h5>Dear ${client.fullname},</h5>
            <h3>You have won a ${reward.title}</h3>
                      <img src=${reward.image} alt="Logo" style="width:100%;">
            <p>Congratulations on your winning, you would be contacted on how to pick up your wins</p>
          </div>
      </div>
      </body>
      </html>
    `,
     };
     transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
               console.log(error);
          } else {
               console.log("Winning mail sent: " + info.response);
               // do something useful
          }
     });
};

module.exports = {
     sendOtp,
     sendForgotPasswordEmail,
     sendAdminWelcomeMail,
     sendConventionCenterWelcomeMail,
     sendCouponCode,
     sendWinningMessage,
};
