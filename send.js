// library
const nodemailer = require("nodemailer");
const fs = require("fs");
const rs = require("randomstring");

// email list dari text file "email.txt"
let mail = fs.readFileSync("email.txt", "utf-8");
let listEmail = mail.split(/\r?\n/);

// smtp config
let smtp = {
  host: "#",
  email: "#",
  password: "#",
  port: "587",
  secure: false, // true untuk port 465, false untuk port yang lain contoh 587
};

// message config
let message = {
  name: "#",
  fromEmail: "#",
  letter: "letter.html", // letter path
  url: "http://google.com/", // url =  ##url##
  delaySend: 5000, // delay send, 1000 = 1 seconds
  pilihRandom: "number", // text = random text, number = random number
  randomText: 10, // lenght random text
  randomNumber: 10, // lenght random number
  attachment: "", // leave blank if not using attchment file
};
// Letter
let letter = fs.readFileSync(message.letter, "utf-8");

// Subject baru untuk random
let subject = () => {
  let random = rand(message.pilihRandom);

  // subject random
  return {
    subject: `tes tes ${random}`,
  };
};

// Untuk random
let rand = (input) => {
  let randomText = rs.generate({
    length: message.randomText,
    capitalization: "lowercase",
  });
  let randomNumber = rs.generate({
    charset: "numeric",
    length: message.randomNumber,
  });

  return input === "text" ? randomText : input === "number" ? randomNumber : console.log("Yang kamu masukan salah!");
};

// send config
let main = async () => {
  let emailPromiseArray = [];

  // sleep
  let sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  let transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.email,
      pass: smtp.password,
    },
  });

  try {
    for (let i = 0; i < listEmail.length; i++) {
      let newLetter = letter.search("##") > 0 ? checkComment(letter) : letter;
      let subjectBaru = subject();
      const send = filterSend(message.attachment);

      function checkComment(input) {
        const match = {
          "##short##": message.url,
          "##email##": listEmail[i],
        };

        return input.replace(/##short##/, match["##short##"]).replace(/##email##/, match["##email##"]);
      }

      async function filterSend(attach) {
        if (attach.toString().length > 0) {
          let sendAttach = await transporter.sendMail({
            from: `${message.name} <${message.fromEmail}>`,
            to: listEmail[i],
            subject: subjectBaru.subject,
            html: newLetter,
            attachments: {
              path: message.attachment,
            },
          });
          return sendAttach;
        } else {
          let send = await transporter.sendMail({
            from: `${message.name} <${message.fromEmail}>`,
            to: listEmail[i],
            subject: subjectBaru.subject,
            html: newLetter,
          });

          return send;
        }
      }

      emailPromiseArray.push(send);

      Promise.all(emailPromiseArray)
        .then((result) => {
          console.log(`[+] Spammed ! [+]`);
          console.log(`- Email send: : ${result[i].accepted}`);
          console.log(`- Total email: : ${i} - ${listEmail.length} email`);
          console.log(`[+] Message [+]`);
          console.log(`- From name: ${message.name}`);
          console.log(`- From email: ${message.fromEmail}`);
          console.log(`- Subject: ${subjectBaru.subject}`);
          console.log(`- Response: ${result[i].response}`);
        })
        .catch((error) => {
          console.log(error.message);
        });
      await sleep(message.delaySend);
    }
  } catch (e) {
    console.log(e.message);
  }
};

main();
