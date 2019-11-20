
(function () {
  const params = {};
  if (location.search && (location.search.length > 1)) {
    location.search.substr(1).split("&").forEach((part) => {
      const pair = part.split("=");
      params[decodeURIComponent(pair[0])] = (pair.length > 1) ? decodeURIComponent(pair[1]) : null;
    });
  }
  const auth_str = window.localStorage.getItem("colombia-auth");
  const do_logout = (params.logout === null);
  const auth = (auth_str && !do_logout) ? JSON.parse(auth_str) : {
    authenticated: false,
  };

  window.document.querySelector("#auth").innerHTML =
    "<span>checking...</span>";

  let promise;
  if (!auth.authenticated && params.code) {
    promise = fetch("http://localhost:8082/token?code=" + params.code)
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
      })
  } else {
    promise = Promise.resolve(null);
  }
  promise
    .then(() => {
      window.localStorage.setItem("colombia-auth", JSON.stringify(auth));
      if (do_logout) {
        delete params.logout;
        location.href = "?" + Object.keys(params)
          .map((param) => encodeURIComponent(param) + "=" + encodeURIComponent(params[param]))
          .join("&");
      } else if (auth.authenticated) {
        window.document.querySelector("#auth").innerHTML =
          "<span>Hi " + auth.name + ", you're logged in!</span>&nbsp;<a href='?logout'>Log Out</a>";
      } else {
        window.document.querySelector("#auth").innerHTML =
          "<span>NOT logged in</span>&nbsp;<a href='./authorize?app=My%20Example'>Log In</a>";
      }
    })
    .catch((error) => {
      console.error(error);
    })
})();
