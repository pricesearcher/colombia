
const decodeQuery = (query) => {
  const params = {};
  if (query.length > 0 && (query.substr(0, 1) === "?")) {
    query = query.substr(1);
  }
  query.split("&").forEach((part) => {
    const pair = part.split("=");
    params[decodeURIComponent(pair[0])] = (pair.length > 1) ? decodeURIComponent(pair[1]) : null;
  });
  return params;
}

const encodeQuery = (params) => {
  return Object.keys(params || {})
    .map((name) => encodeURIComponent(name) + (params[name] ? "=" + encodeURIComponent(params[name]) : ""))
    .join("&");
}

(function () {
  const params = decodeQuery(location.search);
  const auth_str = window.localStorage.getItem("colombia-auth");
  const do_logout = (params.logout === null);
  const auth = (auth_str && !do_logout) ? JSON.parse(auth_str) : {
    authenticated: false,
    state: String(Math.round(Math.random() * 10e15)), // should be crypto-strength
  };

  const store = () => {
    window.localStorage.setItem("colombia-auth", JSON.stringify(auth));
  }

  const reload = () => {
    location.href = "app.html";
  }

  const updateUI = () => {
    if (auth.authenticated) {
      window.document.querySelector("#auth").innerHTML =
        "<span>Hi " + auth.name + ", you're logged in!</span>&nbsp;<a href='?logout'>Log Out</a>";
    } else {
      const query = encodeQuery({
        app: "My Example",
        client_id: "xyz",
        response_type: "code",
        state: auth.state,
      });
      window.document.querySelector("#auth").innerHTML =
        `<span>NOT logged in</span>&nbsp;<a href='./authorize?${query}'>Log In</a>`;
    }
  }

  if (do_logout) {
    store();
    reload();
  }
  if (!auth_str) { // newly-initialized auth object
    store();
  }
  if (!auth.authenticated && params.code) {
    if (params.state !== auth.state) {
      console.error(`state mismatch: orig: ${auth.state} <> received: ${params.state}`);
      updateUI();
      return;
    }
    fetch("http://localhost:8085/token?code=" + params.code)
      .then((data) => {
        console.log(`data received: ${data}`);
        return data.json();
      })
      .then((json) => {
        console.log(`json received: ${JSON.stringify(json)}`);
        if (json.token) {
          auth.token = json.token;
          auth.name  = json.name;
          auth.authenticated = true;
        }
        store();
        reload();
      })
      .catch((error) => {
        console.error(error);
        updateUI();
      })
  } else {
    updateUI();
  }
})();
