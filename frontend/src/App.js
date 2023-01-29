import React, { Component } from "react";
import axios from "axios";
import Joi from "joi";

const URL = "http://localhost:5000/api/url/";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
      redirectURL: "",
      maxTime: "",
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleGenerate = async (event) => {
    event.preventDefault();
    try {
      let { url, maxTime } = this.state;

      if (!checkValidMaxTime(maxTime)) {
        this.setState({ maxTime: 0 });
      }

      if (checkValidUrl(url)) {
        if (!maxTime) {
          maxTime = 0;
        }
        const response = await axios.post(URL, {
          url: url,
          maxTime: maxTime,
        });
        const { value, redirectURL } = response.data;
        this.setState({
          url: value,
          redirectURL: redirectURL,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  handleGoTo = async (event) => {
    event.preventDefault();
    window.open(this.state.url, "_blank");
  };

  render() {
    return (
      <form className="center">
        <label>URL shortner</label>
        <br />
        {inputGenerator("url", this.state.url, "www.wolcker.com", this.handleChange)}
        {inputGenerator("maxTime", this.state.maxTime, "Max time (optional)", this.handleChange)}
        {buttonGenerator("Generate", this.handleGenerate)}
        <br />
        <br />
        {inputGenerator("redirectURL", this.state.redirectURL, "Redirect URL", this.handleChange)}
        {buttonGenerator("Go to", this.handleGoTo)}
      </form>
    );
  }
}

// below is the creation of input and button
const inputGenerator = (name, value, placeholder, handleChange) => {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

const buttonGenerator = (placeholder, onClick) => {
  return (
    <button type="submit" onClick={onClick}>
      {placeholder}
    </button>
  );
};

function checkValidMaxTime(maxTime) {
  const schema = Joi.object().keys({
    maxTime: Joi.number().required().min(1),
  });
  const result = schema.validate(maxTime);
  const { error } = result;
  const valid = error == null;

  if (!valid) {
    return false;
  }

  return true;
}

function checkValidUrl(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export default App;
