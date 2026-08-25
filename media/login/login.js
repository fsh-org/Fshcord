// If logged, redirect
if (localStorage.getItem('token')) {
  location.href = '/';
}

// Utility functions
function proxyFetch(url, o) {
  let opts = {
    method: 'GET',
    headers: {
      'X-Fingerprint': window.fingerprint,
      'accept': '*/*',
      'accept-language': 'en;q=0.9',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
    }
  };
  if (o?.method) opts.method=o.method;
  if (o?.headers) {
    Object.keys(o.headers).forEach(h=>{
      opts.headers[h] = o.headers[h]
    })
  }
  if (o?.body) {
    opts.body = o.body;
    if (!opts.headers['content-type']) opts.headers['content-type']='application/json';
  }
  return fetch('https://api.fsh.plus/request?url='+encodeURIComponent(url), {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(opts),
    signal: AbortSignal.timeout(10000) // 10s max
  })
}

proxyFetch(`https://discord.com/api/v10/experiments`)
.then(res=>res.json())
.then(res=>{
  let dat = JSON.parse(res.content);
  window.fingerprint = dat.fingerprint;
});

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
              });
          }
        });
        break;
      default:
        alert('Unhandled captcha type');
    }
    return;
  }
  if (!data.token) {
    if (!data.mfa||data.suspended_user_token) {
      alert(data.suspended_user_token?'Account suspended':'Login requirements not met');
      return;
    }
    if (data.totp) {
      document.getElementById('totp').style.display = '';
      document.getElementById('btn-login-totp').setAttribute('data-ticket', data.ticket);
      document.getElementById('btn-login-totp').setAttribute('data-inst', data.login_instance_id);
      return;
    }
    alert('Only TOTP MFA supported');
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
    });
};
document.getElementById('btn-login-token').onclick = ()=>{
  localStorage.setItem('token', document.getElementById('u-token').value);
  location.href = '/';
};
document.getElementById('btn-login-totp').onclick = ()=>{
  let ticket = document.getElementById('btn-login-totp').getAttribute('data-ticket');
  ticket = ticket==='null'?null:ticket;
  let inst = document.getElementById('btn-login-totp').getAttribute('data-inst');
  inst = inst==='null'?null:inst;

  proxyFetch(`https://discord.com/api/v10/auth/mfa/totp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      code: document.getElementById('u-code').value,
      ticket,
      login_instance_id: inst
    })
  })
    .then(res=>res.json())
    .then(res=>{
      res = JSON.parse(res.content);
      if (!res.token) {
        alert('Failed');
        return;
      }
      handleResponse(res);
    });
};

document.getElementById('btn-back').onclick = function(){
  document.getElementById('login').style.display = '';
  document.getElementById('captcha').style.display = 'none';
  document.getElementById('totp').style.display = 'none';
};
