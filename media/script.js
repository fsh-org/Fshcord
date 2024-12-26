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
};
function showMessages(list) {
}
function switchMessage(id, type) {
  proxyFetch('https://discord.com/api/v9/channels/'+id+'/messages?limit=20')
    .then(res=>res.json())
    .then(res=>{
      showMessages(JSON.parse(res.content));
    })
}

/*
Channel types
0: Text
1: DM
2: Voice
3: Group DM
4: Category
5: Announcement
10: Thread in announcement
11: Public thread
12: Private thread
13: Stage
14: student thing
15: Forum
16: Media
*/
function showChannels(list) {
  document.getElementById('channel').innerHTML = list.map(c=>{
    let name = c.id;
    if (c.type===1) {
      name = c.recipients[0].global_name ?? c.recipients[0].username;
    } else if (c.type===3) {
      name = c.name ?? (c.recipients.map(r=>r.global_name??r.username).join(', '));
    } else {
      name = c.name ?? c.id;
    }
    return `<button data-id="${c.id}" data-type="${c.type}">
  ${c.type===4?'':`<img src="${c.type===1?(c.recipients[0].avatar?`https://cdn.discordapp.com/avatars/${c.recipients[0].id}/${c.recipients[0].avatar}.webp?size=64`:'./media/channel/1.svg'):`./media/channel/${c.type}.svg`}" alt="${name}">`}
  <span${c.type===4?' style="color:var(--text-2);font-size:90%;"':''}>${c.type===4?name.toLowerCase():name}</span>
</button>`;
  }).join('');
  Array.from(document.querySelectorAll('#channel button'))
    .forEach(b=>{
      b.onclick = function(){switchMessage(b.getAttribute('data-id'), b.getAttribute('data-type'))}
    });
}
function switchChannel(id) {
  if (id == 0) {
    proxyFetch('https://discord.com/api/v10/users/@me/channels')
      .then(res=>res.json())
      .then(res=>{
        showChannels(JSON.parse(res.content).reverse());
      })
  } else if (id == 1) {
    // User
  } else {
    proxyFetch(`https://discord.com/api/v10/guilds/${id}/channels`)
      .then(res=>res.json())
      .then(res=>{
        let channels = JSON.parse(res.content).sort((a,b)=>a.position-b.position);
        let sorted = [];
        let cat = {'null':[]};
        Object.values(channels.filter(c=>c.type===4).map(c=>c.id)).forEach(id=>cat[id]=[]);
        channels.filter(c=>c.type!==4).forEach(c=>cat[c.parent_id].push(c));
        Object.keys(cat).forEach(k=>{
          if (k!='null') sorted.push(channels.find(cc=>cc.id===k));
          sorted.push(...cat[k]);
        })
        showChannels(sorted);
      })
  }
}

if (!localStorage.getItem('token')) {
  document.getElementById('login').showModal();
} else {
  proxyFetch('https://discord.com/api/v9/users/@me/guilds')
    .then(res=>res.json())
    .then(res=>{
      document.getElementById('server-list').innerHTML = JSON.parse(res.content).reverse().map(s=>{
        return `<button aria-label="${s.name}" data-id="${s.id}" class="server-clicky">${s.icon == null ? s.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=64" alt="${s.name}">`}</button>`
      }).join('');
      Array.from(document.querySelectorAll('#server button'))
        .forEach(b=>{
          b.onclick = function(){switchChannel(b.getAttribute('data-id'))}
        });
      switchChannel(0);
    })
}