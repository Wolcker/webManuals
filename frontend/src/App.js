import React, { Component } from "react";

class App extends Component {
  handleGenerateUrl = () => {
    console.log("kebabsås");
  };

  render() {
    return (
      <>
        <img src="/logo.png" alt="logo" className="center" />
        {getTable()};
      </>
    );
  }
}

function getTable() {
  return (
    <table className="center">
      {getTableHeader()}
      {getTableBody()}
    </table>
  );
}

function getTableHeader() {
  return (
    <thead>
      <tr>
        <th colSpan="2">URL shortner</th>
      </tr>
    </thead>
  );
}

function getTableBody() {
  return (
    <tbody>
      <tr>
        <td>{getInput("urlInput", "text", "www.google.com")}</td>
        <td>{getInput("descriptionInput", "text", "Enter shortner here")}</td>
      </tr>
      <tr>
        <td>{getInput("maxSearchInput", "text", "maxSearch")}</td>
        <td>{getInput("maxTimeInput", "text", "minutes")}</td>
      </tr>
      <tr>
        <td>{getButton("urlInputButton", "Generate")}</td>
      </tr>
    </tbody>
  );
}

function getInput(id, type, label) {
  return <input type={type} id={id} value={label} />;
}

function getButton(id, label) {
  return (
    <button onChange={() => this.handleGenerateUrl()} id={id}>
      {label}
    </button>
  );
}

export default App;
