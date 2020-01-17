
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

(async function () {
  const params = decodeQuery(location.search);
  const logging_out = (params.logout === null);
  const auth = await getLocalAuth(logging_out);

  const store = () => {
    auth.newly_created = false;
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
        code_challenge: auth.code_challenge,
        code_challenge_method: auth.code_challenge_method,
      });
      window.document.querySelector("#auth").innerHTML =
        `<span>NOT logged in</span>&nbsp;<a href='./authorize?${query}'>Log In</a>`;
    }
  }

  if (logging_out) {
    store();
    reload();
  }
  if (auth.newly_created) { // newly-initialized auth object
    store();
  }
  if (!auth.authenticated && params.code) {
    if (params.state !== auth.state) {
      console.error(`state mismatch: orig: ${auth.state} <> received: ${params.state}`);
      updateUI();
      return;
    }
    fetch(`http://localhost:8085/token?code=${params.code}&code_verifier=${auth.code_verifier}`)
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



function getCryptoString(num_chars) {
  // each base64 char needs 6 bits, so each 32-bit UInt number can provide 5 chars
  // base64 string is generated from array of octets, each 32-bit UInt number can provide 4...
  const array = new Uint32Array(Math.ceil(num_chars / 4));
  const out = [];
  window.crypto.getRandomValues(array);
  array.forEach((num) => {
    for (let i = 0; (i < 4) && (out.length < num_chars); i += 1) {
      out.push(num % 256);
      num = Math.floor(num / 256);
    }
  });
  return encodeURLSafeBase64(out);
}

/*
function base64EncodeURLSafe(octet_array) {
  // https://tools.ietf.org/html/rfc4648#section-5 (base64url - URL-safe and filename-safe)
  const url_safe_base_64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  let out_str = "";
  function convertThreeOctets(oct1, oct2, oct3) {
    let num = (oct1 * 256 * 256) + (oct2 * 256) + oct3;
    let out_arr = [];
    for (let i = 0; i < 4; i += 1) {
      out_arr.unshift(url_safe_base_64[num % 64]);
      num = Math.floor(num / 64);
    }
    return out_arr.join("");
  }

  let j = 0;
  while (j < (octet_array.length - 2)) {
    out_str += convertThreeOctets(octet_array[j], octet_array[j + 1], octet_array[j + 2]);
    j += 3;
  }
  if (octet_array.length % 3 === 1) {
    console.log(`remainder 1 octet: ${octet_array[j]}`);
    out_str += convertThreeOctets(octet_array[j], 0, 0).substr(0, 1);
  } else if (octet_array.length % 3 === 2) {
    console.log(`remainder 2 octets: ${octet_array[j]} and ${octet_array[j + 1]}`);
    out_str += convertThreeOctets(octet_array[j], octet_array[j + 1], 0).substr(0, 3);
  }

  return out_str;
}
*/

function encodeURLSafeBase64(octet_array) {
  // doesn't work with Typed Array Buffers...
  // const binary_string = octet_array.map(octet => String.fromCharCode(octet)).join("");
  let binary_string = "";
  for (let i = 0; i < octet_array.length; i += 1) {
    binary_string += String.fromCharCode(octet_array[i]);
  }
  return btoa(binary_string)
    .split("=")[0]
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// console.log(encodeURLSafeBase64([ 3, 236, 255, 224, 193 ]));
// "A-z_4ME"

function decodeURLSafeBase64(base64_string) {
  return atob(base64_string
      .replace(/\-/g, "+")
      .replace(/_/g, "/"))
    .split("")
    .map((char) => char.charCodeAt(0));
}


async function encodeSHA256(ascii_string)  {
  const encoder = new TextEncoder();
  const out_array = await crypto.subtle.digest('SHA-256', encoder.encode(ascii_string));
  return new Uint8Array(out_array);
}


async function getPKCEValues() {
  const code_verifier = getCryptoString(64); // 43 - 128 chars required
  const out = {
    code_challenge: encodeURLSafeBase64(await encodeSHA256(code_verifier)),
    code_challenge_method: "S256",
    code_verifier,
  };
  console.log(`getPKCEValues(): ${JSON.stringify(out)}`);
  return out;
}

async function getLocalAuth(logging_out) {
  const auth_str = window.localStorage.getItem("colombia-auth");
  if (auth_str && !logging_out) {
    return JSON.parse(auth_str);
  }
  const pkce_values = await getPKCEValues();
  const auth = {
    newly_created: true,
    authenticated: false,
    state: getCryptoString(32),
    code_verifier: pkce_values.code_verifier,
    code_challenge: pkce_values.code_challenge,
    code_challenge_method: pkce_values.code_challenge_method,
  }
  return auth;
}
