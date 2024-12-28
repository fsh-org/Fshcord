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
function loading(text) {
  Toastify({
    text: 'Loading '+text,
    duration: 2000,
    close: true,
    gravity: 'bottom',
    position: 'right',
    stopOnFocus: true,
    style: {
      background: 'var(--black-1)'
    }
  }).showToast();
}

document.getElementById('btn-login').onclick = function(){
  localStorage.setItem('token', document.getElementById('token').value);
  location.reload();
};

/*
Message types
0: DEFAULT
1: RECIPIENT_ADD
2: RECIPIENT_REMOVE
3: CALL
4: CHANNEL_NAME_CHANGE
5: CHANNEL_ICON_CHANGE
6: CHANNEL_PINNED_MESSAGE
7: USER_JOIN
8: GUILD_BOOST
9: GUILD_BOOST_TIER_1
10: GUILD_BOOST_TIER_2
11: GUILD_BOOST_TIER_3
12: CHANNEL_FOLLOW_ADD
13: GUILD_STREAM
14: GUILD_DISCOVERY_DISQUALIFIED
15: GUILD_DISCOVERY_REQUALIFIED
16: GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING
17: GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING
18: THREAD_CREATED
19: REPLY
20: CHAT_INPUT_COMMAND
21: THREAD_STARTER_MESSAGE
22: GUILD_INVITE_REMINDER
23: CONTEXT_MENU_COMMAND
24: AUTO_MODERATION_ACTION
25: ROLE_SUBSCRIPTION_PURCHASE
26: INTERACTION_PREMIUM_UPSELL
27: STAGE_START
28: STAGE_END
29: STAGE_SPEAKER
30: STAGE_RAISE_HAND
31: STAGE_TOPIC
32: GUILD_APPLICATION_PREMIUM_SUBSCRIPTION
33: PRIVATE_CHANNEL_INTEGRATION_ADDED
34: PRIVATE_CHANNEL_INTEGRATION_REMOVED
35: PREMIUM_REFERRAL
36: GUILD_INCIDENT_ALERT_MODE_ENABLED
37: GUILD_INCIDENT_ALERT_MODE_DISABLED
38: GUILD_INCIDENT_REPORT_RAID
39: GUILD_INCIDENT_REPORT_FALSE_ALARM
40: GUILD_DEADCHAT_REVIVE_PROMPT
41: CUSTOM_GIFT
42: GUILD_GAMING_STATS_PROMPT
43: POLL
44: PURCHASE_NOTIFICATION
45: VOICE_HANGOUT_INVITE
46: POLL_RESULT
47: CHANGELOG
48: NITRO_NOTIFICATION
49: CHANNEL_LINKED_TO_LOBBY
50: GIFTING_PROMPT
51: IN_GAME_MESSAGE_NUX
52: GUILD_JOIN_REQUEST_ACCEPT_NOTIFICATION
53: GUILD_JOIN_REQUEST_REJECT_NOTIFICATION
54: GUILD_JOIN_REQUEST_WITHDRAWN_NOTIFICATION
55: HD_STREAMING_UPGRADED
*/
function showMessages(list) {
  document.getElementById('messages').innerHTML = `<div class="input-bar">
  <input>
  <button></button>
</div>`+list.map(m=>{
    if (m.type !== 0) {
      return '<div>unhandled type: '+m.type+'</div>'
    }
    return `<div class="message">
  <img src="${m.author.avatar?`https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.webp?size=80`:'./media/user.svg'}" aria-hidden="true">
  <span>
    <span>${m.author.global_name ?? m.author.username}</span>
    <span>${m.content}</span>
  </span>
</div>`;
  }).join('');
}
function switchMessage(id, type) {
  proxyFetch(`https://discord.com/api/v10/channels/${id}/messages?limit=20`)
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
    if (c.type===4) {
      return `<span style="color:var(--text-2);font-size:80%;">${name.toUpperCase()}</span>`
    }
    return `<button data-id="${c.id}" data-type="${c.type}">
  <img src="${c.type===1?(c.recipients[0].avatar?`https://cdn.discordapp.com/avatars/${c.recipients[0].id}/${c.recipients[0].avatar}.webp?size=64`:'./media/channel/1.svg'):`./media/channel/${c.type}.svg`}" alt="${name}">
  <span>${name}</span>
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

function showServers(list) {
  document.getElementById('server-list').innerHTML = list.reverse().map(s=>{
    return `<button aria-label="${s.name}" data-id="${s.id}" class="server-clicky">${s.icon == null ? s.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=64" alt="${s.name}">`}</button>`
  }).join('');
  Array.from(document.querySelectorAll('#server button'))
    .forEach(b=>{
      b.onclick = function(){
        let sid = b.getAttribute('data-id');
        // Set selected
        let previous = document.querySelector('#server button[selected]');
        previous.classList.add('leaving');
        setTimeout(() => {
          previous.classList.remove('leaving');
          previous?.removeAttribute('selected');
        }, 250);
        b.setAttribute('selected', true);
        // Switch the server and show channels
        loading(b.getAttribute('aria-label'));
        window.currentServer = sid;
        switchChannel(sid);
      }
    });
}

if (!localStorage.getItem('token')) {
  document.getElementById('login').showModal();
} else {
  window.data = {};
  loading('settings');
  // TODO: Switch to new settings system
  proxyFetch('https://discord.com/api/v10/users/@me/settings')
    .then(res=>res.json())
    .then(res=>{
      window.data.settings = JSON.parse(res.content);
      loading('servers');
      proxyFetch('https://discord.com/api/v10/users/@me/guilds')
        .then(res=>res.json())
        .then(res=>{
          let servers = JSON.parse(res.content);
          window.data.servers = servers;
          window.data.currentServer = 0;
          showServers(servers);
          switchChannel(0);
        })
    })
}