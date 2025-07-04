const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/scan", (req, res) => {
  const domain = req.body.domain;
  const results = {};

  exec(`whois ${domain}`, (err, stdout, stderr) => {
    results.whois = stdout;

    exec(`nmap -F ${domain}`, (err, stdout, stderr) => {
      results.nmap = stdout;

      exec(
        `gobuster dir -u http://${domain} -w /Users/rahullingampally/Desktop/examcheating/gobuster/small.txt`,
        { env: process.env },
        (err, stdout, stderr) => {
          results.gobuster = stdout;

          // Add Sublist3r call
          exec(
            `sublist3r -d ${domain} -o /Users/rahullingampally/Desktop/examcheating/sublist3r/names.txt`,
            (err, stdout, stderr) => {
              if (err) {
                console.error(err);
                results.subdomains = stderr || "Sublist3r scan failed.";
                return res.json(results);
              }

              // Read subdomains.txt
              const fs = require("fs");
              fs.readFile("/Users/rahullingampally/Desktop/examcheating/sublist3r/names.txt", "utf8", (err, data) => {
                if (err) {
                  results.subdomains = "Could not read subdomain file.";
                } else {
                  results.subdomains = data;
                }

                res.json(results);
              });
            }
          );
        }
      );
    });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
