// Useful funcs
function proxyFetch(url, o) {
  let opts = {
    method: "GET",
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en;q=1.0",
      authorization: localStorage.getItem('token'),
      "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?0 ",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "user-agent": navigator.userAgent
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

document.getElementById('btn-login').onclick = function(){
  localStorage.setItem('token', document.getElementById('token').value);
  location.reload();
}
if (!localStorage.getItem('token')) {
  document.getElementById('login').showModal();
} else {
  proxyFetch('https://discord.com/api/v9/users/@me/guilds')
    .then(res=>res.json())
    .then(res=>{
      document.getElementById('server-list').innerHTML = JSON.parse(res.content).reverse().map(s=>{
        if (s.icon == null) {
          return `<button aria-label="${s.name}" class="server-clicky">${s.name.trim().split(/\s+/).map(word=>word[0]??'').join('')}</button>`
        }
        return `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=64" alt="${s.name}" class="server-clicky">`
      }).join('');
    })
}