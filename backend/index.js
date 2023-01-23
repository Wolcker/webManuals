//Backend documentation:
//Comments will say what the code does if not given a smart name
//Comments will be used before the code is executed

const express = require("express");
const crypto = require("crypto");
const Joi = require("joi");
const app = express();

//urls is a static array as assignment didn't give promission to use DB
const urls = [
  {
    id: "f9b327e70bbcf42494ccb28b2d98e00e",
    value: "www.google.com",
    description: "google",
    maxSearched: 10,
  },
  {
    id: "f9b327e70bbcf42494ccb28b2d98e00f",
    value: "www.facebook.com",
    description: "fb",
    maxSearched: 10,
  },
  {
    id: "f9b327e70bbcf42494ccb28b2d98e00g",
    value: "www.netflix.com",
    description: "netflix",
    maxSearched: 10,
  },
];

//Mades all "req.body" into json
app.use(express.json());

//a must have hello world
app.get("/", (req, res) => {
  return res.send("Hello World");
});

//GET to get the specific url that uses a description
app.get("/api/url/:description", (req, res) => {
  const url = getUrl(req.params.description);
  if (!url)
    return res
      .status(404)
      .send(`the url description: ${req.params.description} was not found`);
  return res.send(url);
});

//POSTs a url to the urls array, note that new urls will disappear when app is restarted
app.post("/api/url", (req, res) => {
  const schema = getJoiSchema();
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error);

  const url = {
    id: getNewId(),
    value: req.body.value,
    description: req.body.description,
    maxSearched: req.body.maxSearched,
  };
  urls.push(url);
  return res.send(urls);
});

//Will update the specific url
app.put("/api/url:id", (req, res) => {
  const schema = getJoiSchema();
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error);
  const url = getUrl(req.params.description);
  if (!url)
    return res
      .status(404)
      .send(`the url description: ${req.params.description} was not found`);

  url.value = req.body.value != null ? req.body.value : url.value;
  url.description =
    req.body.description != null ? req.body.description : url.description;
  url.maxSearched =
    req.body.maxSearched != null ? req.body.maxSearched : url.maxSearched;
  return res.send(url);
});

app.listen(5000, () => console.log("Listening on port 5000"));

function getJoiSchema() {
  return Joi.object({
    value: Joi.string().required().min(2).max(1000),
    description: Joi.string().required().min(2),
    maxSearched: Joi.number().required().min(0).max(20),
  });
}

function getUrl(description) {
  return urls.filter((u) => u.description == description);
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