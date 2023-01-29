const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const Joi = require("joi");
const app = express();
const port = 5000;

let URLS = [
  {
    id: "d424b1b7bcc45860ec47f09c219861da",
    value: "https://www.google.com",
    redirectURL: "google",
    maxTime: addMinutes(new Date(), 0),
  },
  {
    id: "d424b1b7bcc45860ec47f09c219861dc",
    value: "https://www.facebook.com",
    redirectURL: "fb",
    maxTime: addMinutes(new Date(), 1),
  },
  {
    id: "d424b1b7bcc45860ec47f09c219861dj",
    value: "https://www.netflix.com",
    redirectURL: "netflix",
    maxTime: addMinutes(new Date(), 3),
  },
];

app.use(express.json());
app.use(cors());
app.get("/api/url", (req, res) => {
  return res.send(URLS);
});

//GET to get the specific url that uses a description
app.get("/api/url/:redirectURL", (req, res) => {
  const redirectURL = req.params.redirectURL;
  const url = getUrlByshortner(redirectURL);
  const { value: website, maxTime } = url;

  if (!url) {
    return res.status(404).send(`The url redirectURL: ${redirectURL} was not found`);
  }
  if (new Date() > maxTime && maxTime != 0) {
    return res.status(404).send(`Sorry to late, the time have expired to use this short url`);
  }

  res.redirect(website);
});

//POSTs a url to the urls array, note that new urls will disappear when app is restarted
app.post("/api/url", (req, res) => {
  const schema = getJoiSchema();

  const result = schema.validate(req.body);
  const { error } = result;
  const valid = error == null;

  if (!valid) {
    res.status(422).json({
      message: "Invalid request",
      data: body,
    });
  } else {
    const { url, maxTime } = req.body;
    const website = getWebsite(url);

    const tmpUrl = {
      id: getNewId(),
      value: website,
      redirectURL: createShortner(),
      infinitSearch: false,
      maxTime: addMinutes(new Date(), maxTime),
    };

    URLS.push(tmpUrl);
    res.status(200).send(tmpUrl);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//Here comes functions
// Joi schema to validate
function getJoiSchema() {
  return Joi.object().keys({
    url: Joi.string().required().min(8).max(1000),
    maxTime: Joi.number().optional().min(0),
  });
}

//functions for the creation of tmpUrl, when POST.
function getNewId() {
  let id = crypto.randomBytes(16).toString("hex");
  let checkId = URLS.find((u) => u.id == id);
  while (checkId) {
    id = crypto.randomBytes(16).toString("hex");
    checkId = URLS.find((u) => u.id == id);
  }
  return id;
}

function getWebsite(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function createShortner() {
  return Math.random().toString(36).substring(2, 7);
}

function addMinutes(date, minutes) {
  if (!minutes) {
    return 0;
  }
  return new Date(date.getTime() + minutes * 60000).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

//functions for searching Urls when redirecting in GET and specifik shortner/redirectURL
function getUrlByshortner(redirectURL) {
  const url = URLS.find((u) => u.redirectURL === redirectURL);
  return url;
}
