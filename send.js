// library
const nodemailer = require("nodemailer");
const fs = require("fs");
const rn = require("random-number");

// get email list
let mail = fs.readFileSync("email.txt", "utf-8");
let listEmail = mail.split(/\r?\n/);

// random
let rand = {
  min: 1,
  max: 9999999,
  integer: true,
};

// smtp config
let smtp = {
  host: "#",
  email: "#",
  password: "kuching@123",
  port: "#",
  secure: false, // true for 465, false for other ports
};

// message config
let message = {
  name: "#",
  fromEmail: "#",
  subject: "#" + rn(rand),
  letter: fs.readFileSync("message.html", "utf-8"),
};

// send config
async function main() {
  let emailPromiseArray = [];

  // sleep function
  let sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  // get smtp config for send
  let transporter = nodemailer.createTransport({
    host: smtp["host"],
    port: smtp["port"],
    secure: smtp["secure"],
    auth: {
      user: smtp["email"],
      pass: smtp["password"],
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  try {
    for (let i = 0; i < listEmail.length; i++) {
      // ready to send
      let send = await transporter.sendMail({
        from: `${message["name"]} <${message["fromEmail"]}>`,
        to: listEmail[i],
        subject: message["subject"],
        html: message["letter"],
      });

      // get the send response,and put in to array
      await emailPromiseArray.push(send);

      // print response to log
      Promise.all(emailPromiseArray)
        .then((result) => {
          console.log(`[+] Success ! [+]`);
          console.log(`- Email send: : ${result[i]["accepted"]}`);
          console.log(`- Total email: : ${i} - ${listEmail.length} email`);
          console.log(`[+] Message [+]`);
          console.log(`- From name: ${message["name"]}`);
          console.log(`- From email: ${message["fromEmail"]}`);
          console.log(`- Subject: ${message["subject"]}`);
          console.log(`- Response: ${result[i]["response"]}`);
        })
        .catch((error) => {
          console.log(error.message);
        });
      // delay send, 3000 = 3 seconds
      await sleep(3000);
    }
  } catch (e) {
    console.log(e.message);
  }
}

// run the sender
main();
