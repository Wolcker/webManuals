//Backend documentation:
//Comments will say what the code does if not given a smart name
//Comments will be used before the code is executed

const express = require("express");
const crypto = require("crypto");
const Joi = require("joi");
const app = express();

let urls = [
  {
    id: "d424b1b7bcc45860ec47f09c219861da",
    value: "https://www.google.com",
    description: "google",
    maxSearched: 2,
    searched: 0,
    maxTime: addMinutes(new Date(), 5),
  },
  {
    id: "d424b1b7bcc45860ec47f09c219861dc",
    value: "https://www.facebook.com",
    description: "fb",
    maxSearched: 5,
    searched: 0,
    maxTime: addMinutes(new Date(), 1),
  },
  {
    id: "d424b1b7bcc45860ec47f09c219861dj",
    value: "https://www.netflix.com",
    description: "netflix",
    maxSearched: 7,
    searched: 0,
    maxTime: addMinutes(new Date(), 3),
  },
];

app.use(express.json());

app.get("/api/url", (req, res) => {
  return res.send(urls);
});

//GET to get the specific url that uses a description
app.get("/api/url/:description", (req, res) => {
  const description = req.params.description;
  const url = getUrlByDescription(description);

  if (!url) {
    return res.status(404).send(`The url description: ${description} was not found`);
  }

  if (url.searched >= url.maxSearched) {
    return res.status(404).send(`The url have been used to many times`);
  }

  if (new Date() > url.maxTime) {
    return res.status(404).send(`Sorry to late, the time have expired to use this short url`);
  }

  url.searched++;

  const website = url.value;
  return res.redirect(website);
});

//POSTs a url to the urls array, note that new urls will disappear when app is restarted
app.post("/api/url", (req, res) => {
  const schema = getJoiSchema();
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error);
  }
  const { value, description, maxSearched, maxTime } = req.body;

  const tmpUrl = getUrlByValue(value);

  if (tmpUrl) {
    return res.status(400).send(error);
  }

  const url = {
    id: getNewId(),
    value: value,
    description: description,
    maxSearched: maxSearched,
    searched: 0,
    maxTime: addMinutes(new Date(), maxTime != null ? maxTime : 1),
  };

  urls.push(url);
  return res.send(urls);
});

//Will update the specific url
app.put("/api/url/:id", (req, res) => {
  const schema = getJoiSchema();
  const { error } = schema.validate(req.body);
  const { value, description, maxSearched, searched, maxTime } = req.body;
  const url = getUrlById(req.params.id);
  const urlDescription = getUrlByDescription(description);
  const urlValue = getUrlByValue(value);

  if (error) {
    return res.status(400).send(error);
  }

  if (!url) {
    return res.status(404).send(`the url id: ${req.params.id} was not found`);
  }

  if (urlDescription || urlValue) {
    return res.status(400).send(`Value or description are already used`);
  }

  url.value = value != null ? value : url.value;
  url.description = description != null ? description : url.description;
  url.maxSearched = maxSearched != null ? maxSearched : url.maxSearched;
  url.searched = searched != 0 ? searched : url.searched;
  url.maxTime = maxTime != 0 ? maxTime : url.maxTime;

  return res.send(url);
});

app.listen(5000, () => console.log("Listening on port 5000"));

function getJoiSchema() {
  return Joi.object({
    value: Joi.string().required().min(2).max(1000),
    description: Joi.string().required().min(2),
    maxSearched: Joi.number().required().min(0).max(20),
    searched: Joi.number().optional().min(0),
    maxTime: Joi.number().optional().min(0),
  });
}

function getUrlByDescription(description) {
  return urls.find((u) => u.description == description);
}

function getUrlByValue(value) {
  return urls.find((u) => u.value == value);
}

function getUrlById(id) {
  return urls.find((u) => u.id == id);
}

function getNewId() {
  let id = crypto.randomBytes(16).toString("hex");
  let checkId = urls.find((u) => u.id == id);
  while (checkId) {
    id = crypto.randomBytes(16).toString("hex");
    checkId = urls.find((u) => u.id == id);
  }
  return id;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
