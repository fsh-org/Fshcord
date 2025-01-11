// If logged, redirect
if (localStorage.getItem('token')) {
  location.href = '/';
}

// Utility functions
function proxyFetch(url, o) {
  let opts = {
    method: "GET",
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en;q=1.0",
      "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0 ",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVzLUVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTMxLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM1ODAxMSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZX0=",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
  };
  if (o?.method) opts.method=o.method;
  if (o?.body) opts.body=o.body;
  if (o?.headers) {
    Object.keys(o.headers).forEach(h=>{
      opts.headers[h] = o.headers[h]
    })
  }
  return fetch('https://api.fsh.plus/request?url='+encodeURIComponent(url), {
    method: 'POST',
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(opts)
  })
}

proxyFetch(`https://discord.com/api/v10/experiments`)
.then(res=>res.json())
.then(res=>{
  let dat = JSON.parse(res.content);
  window.fingerprint = dat.fingerprint;
})

function handleResponse(data) {
  console.log(data);
  document.getElementById('login').style.display = 'none';
  document.getElementById('captcha').style.display = 'none';
  document.getElementById('totp').style.display = 'none';
  if (data.errors) {
    document.getElementById('login').style.display = '';
    return;
  }
  if (data.captcha_key) {
    document.getElementById('captcha').style.display = '';
    document.getElementById('h-captcha').innerText = '';
    switch (data.captcha_service) {
      case 'hcaptcha':
        hcaptcha.render('h-captcha', {
          theme: 'dark',
          sitekey: data.captcha_sitekey,
          rqdata: data.captcha_rqdata,
          callback: function(token) {
            proxyFetch(`https://discord.com/api/v10/auth/login`, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-captcha-key': token,
                'x-captcha-rqtoken': (data.captcha_rqtoken??null),
                'x-fingerprint': window.fingerprint
              },
              body: JSON.stringify({
                login: document.getElementById('u-login').value,
                password: document.getElementById('u-password').value,
                undelete: true
              })
            })
              .then(res=>res.json())
              .then(res=>{
                handleResponse(JSON.parse(res.content));
              })
          }
        });
        break;
      default:
        alert('Unhandled captcha type');
    }
    return;
  }
  /*{
  "user_id": "id",
  "mfa": true,
  "sms": true,
  "ticket": "h.h.h-h-h",
  "backup": true,
  "totp": true,
  "webauthn": null
  }*/
  if (!data.token) {
    if (data.totp) {
      document.getElementById('totp').style.display = '';
      document.getElementById('btn-login-totp').setAttribute('ticket', data.ticket);
      return;
    }
    if (data.mfa || data.sms || data.backup || data.webauthn) {
      alert('We dont support sms, backup or webauthn mfa yet');
      return;
    }
    return;
  } else {
    localStorage.setItem('token', data.token);
    location.href = '/';
  }
}

document.getElementById('btn-login').onclick = function(){
  proxyFetch(`https://discord.com/api/v10/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      login: document.getElementById('u-login').value,
      password: document.getElementById('u-password').value,
      undelete: true
    })
  })
    .then(res=>res.json())
    .then(res=>{
      handleResponse(JSON.parse(res.content));
    })
};
document.getElementById('btn-login-token').onclick = function(){
  localStorage.setItem('token', document.getElementById('u-token').value);
  location.href = '/';
};
document.getElementById('btn-login-totp').onclick = function(){
  proxyFetch(`https://discord.com/api/v10/auth/mfa/totp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      code: document.getElementById('u-code').value,
      ticket: document.getElementById('btn-login-totp').getAttribute('ticket')
    })
  })
    .then(res=>res.json())
    .then(res=>{
      if (!data.token) {
        alert('Failed')
      }
      handleResponse(JSON.parse(res.content));
    })
};

document.getElementById('btn-back').onclick = function(){
  document.getElementById('login').style.display = '';
  document.getElementById('captcha').style.display = 'none';
  document.getElementById('totp').style.display = 'none';
};