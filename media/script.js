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
function parseMD(text) {
  return text
    .replaceAll('<', '~lt;')
    .replaceAll('"', '~quot;')
    .replaceAll(/(~lt;https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)>|https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g, function(match){
      if (match.match(/^~lt;.+?>$/m)) match=match.slice(4,-1);
      return `<a href="${match}">${match}</a>`
    })
    .replaceAll('&', '&amp;')
    .replaceAll('~lt;', '&lt;')
    .replaceAll('~quot;', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll(/\*\*.+?\*\*/g, function(match){return '<b>'+match.slice(2,-2)+'</b>'})
    .replaceAll(/\*.+?\*/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'})
    .replaceAll(/\_\_.+?\_\_/g, function(match){return '<u>'+match.slice(2,-2)+'</u>'})
    .replaceAll(/\_.+?\_/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'})
    .replaceAll(/\~\~.+?\~\~/g, function(match){return '<s>'+match.slice(2,-2)+'</s>'})
    .replaceAll(/\|\|.+?\|\|/g, function(match){return `<span style="cursor:pointer;color:var(--bg-3);border-radius:0.25rem;background-color:var(--bg-3);transition:500ms;" onclick="this.style.color='var(--text-1)';this.style.backgroundColor='var(--bg-0)'">`+match.slice(2,-2)+'</span>'})
    .replaceAll(/^\> .+?$/gm, function(match){return '<blockquote>'+match.slice(2)+'</blockquote>'})
    .replaceAll(/^### .+?$/gm, function(match){return '<span style="font-size:110%">'+match.slice(4)+'</span>'})
    .replaceAll(/^## .+?$/gm, function(match){return '<span style="font-size:125%">'+match.slice(3)+'</span>'})
    .replaceAll(/^# .+?$/gm, function(match){return '<span style="font-size:150%">'+match.slice(2)+'</span>'})
    .replaceAll(/^-# .+?$/gm, function(match){return '<span style="font-size:80%;color:var(--text-2);">'+match.slice(3)+'</span>'})
    .replaceAll(/^(-|\*) .+?$/gm, function(match){return '<li>'+match.slice(2)+'</li>'});
}
const channelIcons = {};
function fetchChannelIcon(type) {
  return new Promise((resolve, reject) => {
    fetch('/media/channel/'+type+'.svg')
      .then(res=>res.text())
      .then(res=>{
        channelIcons[type] = res;
        resolve();
      })
      .catch(err=>{
        reject()
      });
  })
}
function getChannelIcon(type, size) {
  if (channelIcons[type]) {
    return channelIcons[type]
      .replace(/width="[0-9]+?"/, `width="${size}"`)
      .replace(/height="[0-9]+?"/, `height="${size}"`);
  } else {
    return '<img>';
  }
}
function getUserAvatar(id, hash, size = 64) {
  return `https://cdn.discordapp.com/avatars/${id}/${hash}.${hash.startsWith('a_')?'gif':'webp'}?size=${size}`;
}
function colorToRGB(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
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
function report(text, obj) {
  fetch(`https://telemetry.fsh.plus?url=${encodeURIComponent(location.href)}&text=${text}&context=${encodeURIComponent(JSON.stringify(obj, null, 2))}`, { method: 'POST' })
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
  document.getElementById('messages').innerHTML = list.map(m=>{
    // System non changing
    if ([14,15,16,17,22].includes(m.type)) {
      const texts = {
        '14': `This server has been removed from Server Discovery because it no longer passes all the requirements. Check Server Settings for more details.`,
        '15': `This server is eligible for Server Discovery again and has been automatically relisted!`,
        '16': `This server has failed Discovery activity requirements for 1 week. If this server fails for 4 weeks in a row, it will be automatically removed from Discovery.`,
        '17': `This server has failed Discovery activity requirements for 3 weeks in a row. If this server fails for 1 more week, it will be removed from Discovery.`,
        '22': `Wondering who to invite?\nStart by inviting anyone who can help you build the server!`
      };
      return `<div class="message">
  <img src="./media/fshcord.png" width="40" height="40" aria-hidden="true">
  <span>
    <span><span class="name">System</span></span>
    <span>${texts[m.type.toString()]}</span>
  </span>
</div>`;
    }
    // Group DM/Thread add/remove member
    if ([1,2].includes(m.type)) {
      return `<div class="message">
  <img src="./media/fshcord.png" width="40" height="40" aria-hidden="true">
  <span>
    <span><span class="name">System</span></span>
    <span>${m.author.global_name ?? m.author.username} ${m.type===1?'added':'removed'} ${m.mentions[0].global_name ?? m.mentions[0].username} ${m.type===1?'to':'from'} the ${window.data.currentChannelType===3?'group':'thread'}.</span>
  </span>
</div>`;
    }
    // Call
    if (m.type===3) {
      return `<div class="message">
  <img src="./media/fshcord.png" width="40" height="40" aria-hidden="true">
  <span>
    <span><span class="name">System</span></span>
    <span>${m.call.ended_timestamp ?
      (m.call.participants.includes(window.data.user.id) ?
        `${m.author.global_name ?? m.author.username} started a call that ended.` :
        `You missed a call from ${m.author.global_name ?? m.author.username}.`) :
      `${m.author.global_name ?? m.author.username} started a call.`}</span>
  </span>
</div>`;
    }
    // Normal
    if (![0,19].includes(m.type)) {
      report(`Unhandled message type: ${m.type}`, m);
      return `<div>Unhandled message type: ${m.type}</div>`;
    }
    return `<div class="message">
  <img src="${m.author.avatar?getUserAvatar(m.author.id, m.author.avatar):'./media/user.svg'}" width="40" height="40" aria-hidden="true">
  <span>
    <span><span class="name">${m.author.global_name ?? m.author.username}</span>${m.edited_timestamp?' · Edited':''}</span>
    <span>${parseMD(m.content)}</span>
    ${m.attachments.length?m.attachments.map(attach=>{
      return `<${attach.content_type.startsWith('image/')?'img':attach.content_type.startsWith('audio/')?'audio':attach.content_type.startsWith('video/')?'video':'div'} src="${attach.url}"  width="${Math.floor(attach.width/2)}" height="${Math.floor(attach.height/2)}" class="message-attach" controls>${attach.content_type.startsWith('image/')?'':attach.content_type.startsWith('audio/')?'</audio>':attach.content_type.startsWith('video/')?'</video>':`<a download="${attach.filename}">${attach.filename}</a></div>`}`;
    }).join(''):''}
    ${m.embeds.length?m.embeds.map(embed=>{
      /*
application_news
article
auto_moderation_message
auto_moderation_notification
gift
gifv
image
link
post_preview
rich
video
*/
      switch (embed.type) {
        case 'gifv':
          return `<video src="${embed.video.proxy_url}" width="${Math.floor(embed.video.width/2)}" height="${Math.floor(embed.video.height/2)}" muted autoplay loop class="message-attach"></video>`;
        case 'image':
          return `<img src="${embed.thumbnail.proxy_url}"  width="${Math.floor(embed.thumbnail.width/2)}" height="${Math.floor(embed.thumbnail.height/2)}" class="message-attach">`;
        default:
          report(`Unknown embed type: ${embed.type}`, embed);
          return `<span>Unknown embed type: ${embed.type}</span>`;
      }
    }).join(''):''}
    ${m.sticker_items?.length?m.sticker_items.map(sticker=>{
      if (sticker.format_type===3) {
        return `<lottie-sticker class="message-attach" data-id="${sticker.id}"></lottie-sticker>`;
      }
      return `<img src="https://media.discordapp.net/stickers/${sticker.id}.${['webp','png','png','webp','gif'][sticker.format_type]}?size=160&quality=lossless" width="160" height="160" class="message-attach">`;
    }).join(''):''}
    ${m.reactions?.length?`<div class="reactions">${m.reactions.map(reaction=>{
      /*[
  {
    "emoji": {
      "id": null,
      "name": "❌"
    },
    "count": 1,
    "count_details": {
      "normal": 1
    },
    "me": true,
  },
  {
    "emoji": {
      "id": "1317019686067769405",
      "name": "EeveePeek"
    },
    "count": 1,
    "count_details": {
      "normal": 1
    },
    "me": true,
  }
]*/
      return `<button>${reaction.emoji.name}${reaction.count}</button>`;
    }).join('')}</div>`:''}
  </span>
</div>`;
  }).join('');
  Array.from(document.querySelectorAll('lottie-sticker.message-attach'))
    .forEach(s=>{
      lottie.loadAnimation({
        container: s,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: `https://api.fsh.plus/file?url=${encodeURIComponent(`https://discord.com/stickers/${s.getAttribute('data-id')}.json`)}`
      });
    });
  document.getElementById('messages').scrollTop = 0;
}
function switchMessage(id, type) {
  type = Number(type);
  // Category??
  if (type==4) return;
  // Set current
  this.data.currentChannel = id;
  this.data.currentChannelType = type;
  // Text
  if ([0,1,3,5,10,11,12].includes(type)) {
    proxyFetch(`https://discord.com/api/v10/channels/${id}/messages?limit=50`)
      .then(res=>res.json())
      .then(res=>{
        showMessages(JSON.parse(res.content));
      })
    return;
  }/*
  // Forum
  if ([15,16].includes(type)) {
    return;
  }
  // Voice
  if ([2,13].includes(type)) {
    return;
  }*/
  report(`Unhandled channel type: ${type}`, [id, type]);
}

/*
Channel types
0: GUILD_TEXT
1: DM
2: GUILD_VOICE
3: GROUP_DM
4: GUILD_CATEGORY
5: GUILD_NEWS
6: GUILD_STORE
7: GUILD_LFG
8: LFG_GROUP_DM
9: THREAD_ALPHA
10: NEWS_THREAD
11: PUBLIC_THREAD
12: PRIVATE_THREAD
13: GUILD_STAGE_VOICE
14: GUILD_DIRECTORY
15: GUILD_FORUM
16: GUILD_MEDIA
17: LOBBY
18: DM_SDK
*/
function channelName(c) {
  let name = c.id;
  if (c.type === 1) {
    name = c.recipients[0].global_name ?? c.recipients[0].username;
  } else if (c.type === 3) {
    name = c.name ?? (c.recipients.map(r=>r.global_name??r.username).join(', '));
  } else {
    name = c.name ?? c.id;
  }
  if (c.type === 4) {
    name = name.toUpperCase();
  }
  return name;
}
function showChannels(list) {
  document.getElementById('channel').innerHTML = list.map(c=>{
    let name = channelName(c);
    if (c.type===4) {
      return `<span style="color:var(--text-2);font-size:80%;">${name}</span>`
    }
    return `<button data-id="${c.id}" data-type="${c.type}" data-name="${name}">
  ${c.type===1&&c.recipients[0].avatar?`<img src="${getUserAvatar(c.recipients[0].id, c.recipients[0].avatar, 32)}" width="20" height="20" aria-hidden="true">`:getChannelIcon(c.type, 20)}
  <span>${name}</span>
</button>`;
  }).join('');
  Array.from(document.querySelectorAll('#channel button'))
    .forEach(b=>{
      b.onclick = function(){
        loading(b.getAttribute('data-name'));
        document.getElementById('top-name').innerText = b.getAttribute('data-name');
        switchMessage(b.getAttribute('data-id'), b.getAttribute('data-type'));
      }
    });
}
function switchChannel(id) {
  if (id == 0) {
    proxyFetch('https://discord.com/api/v10/users/@me/channels')
      .then(res=>res.json())
      .then(res=>{
        // Show channels
        let list = JSON.parse(res.content).sort((a,b)=>b.last_message_id-a.last_message_id);
        showChannels(list);
        // Select first
        loading(channelName(list[0]));
        switchMessage(list[0].id, list[0].type);
      })
  } else if (id == 1) {
    // User
  } else {
    proxyFetch(`https://discord.com/api/v10/guilds/${id}/channels`)
      .then(res=>res.json())
      .then(res=>{
        // Get and sort the channels
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
        // Load first
        let first = sorted.filter(c=>c.type!==4)[0];
        loading(channelName(first));
        switchMessage(first.id, first.type);
      })
  }
}

function showServers(list) {
  document.getElementById('server-list').innerHTML = list.map(s=>{
    if (s.type==='folder') {
      return `<div aria-label="${s.name??'Folder'}" aria-role="button" class="server-folder" style="--folder-color:${colorToRGB(s.color??0)}">
  <img onclick="let op=(this.getAttribute('open')==='true');this.setAttribute('open', !op);this.parentElement.style.height=(!op?'${(s.guilds.length+1)*50+s.guilds.length*10}px':'50px')" open="false">
  ${s.guilds.map(g=>`<button aria-label="${g.name}" data-id="${g.id}" class="server-clicky">${g.icon == null ? g.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64" alt="${g.name}">`}</button>`).join('')}
</div>`;
    }
    return `<button aria-label="${s.name}" data-id="${s.id}" class="server-clicky">${s.icon == null ? s.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=64" alt="${s.name}">`}</button>`
  }).join('');
  Array.from(document.querySelectorAll('#server button'))
    .forEach(b=>{
      b.onclick = function(){
        let sid = b.getAttribute('data-id');
        // Set selected
        let previous = document.querySelector('#server button[selected]');
        if (!b.isSameNode(previous)) {
          previous.classList.add('leaving');
          setTimeout(() => {
            previous.classList.remove('leaving');
            previous?.removeAttribute('selected');
          }, 250);
          b.setAttribute('selected', true);
        }
        // Switch the server and show channels
        loading(b.getAttribute('aria-label'));
        window.currentServer = sid;
        switchChannel(sid);
      }
    });
}
function switchServers(list) {
  let ordered = [];
  window.data.settings.guild_folders.forEach(f => {
    if (f.guild_ids.length<2) {
      ordered.push(list.find(s=>s.id===f.guild_ids[0]))
    } else {
      ordered.push({
        type: 'folder',
        id: f.id,
        name: f.name,
        color: f.color,
        guilds: f.guild_ids.map(g=>list.find(s=>s.id===g))
      })
    }
  });
  showServers(ordered);
}

if (!localStorage.getItem('token')) {
  document.getElementById('login').showModal();
} else {
  window.data = {};
  loading('user');
  window.data.servers = [];
  window.data.currentServer = 0;
  window.data.currentChannel = 0;
  window.data.currentChannelType = 0;
  // TODO: Switch to new settings system
  proxyFetch('https://discord.com/api/v10/users/@me')
    .then(res=>res.json())
    .then(async res=>{
      let user = JSON.parse(res.content);
      window.data.user = user;
      if (user.avatar) {
        document.querySelector('#account img').src = getUserAvatar(user.id, user.avatar, 80)
      }

      loading('settings');
      let settings = await proxyFetch('https://discord.com/api/v10/users/@me/settings');
      settings = await settings.json();
      settings = JSON.parse(settings.content);
      window.data.settings = settings;

      loading('servers');
      let servers = await proxyFetch('https://discord.com/api/v10/users/@me/guilds');
      servers = await servers.json();
      servers = JSON.parse(servers.content);
      window.data.servers = servers;
      switchServers(servers);

      loading('icons')
      await fetchChannelIcon(0)
      await fetchChannelIcon(1)
      await fetchChannelIcon(2)
      await fetchChannelIcon(3)
      await fetchChannelIcon(5)
      await fetchChannelIcon(15)

      loading('DMs');
      switchChannel(0);
    })
}