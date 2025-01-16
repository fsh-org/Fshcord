function showContextMenu(event, type, data) {
  event.preventDefault();
  let menu = document.getElementById('contextmenu');
  menu.show();
  menu.style.left = event.x+'px';
  menu.style.top = event.y+'px';
  switch(type) {
    case 'server':
      menu.innerHTML = `<button onclick="copy('${data.name}')">Copy name</button>
<button onclick="copy('${data.id}')">Copy id</button>`;
      break;
    default:
      menu.innerHTML = 'Error';
      report('Unknown context menu type: '+type, data);
  }
}
window.onclick = function(){document.getElementById('contextmenu').close()};

function sendMessage() {
  proxyFetch(`https://discord.com/api/v10/channels/${window.data.currentChannel}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: document.getElementById('message-input').value
    })
  })
    .then(res=>res.json())
    .then(res=>{
      document.getElementById('message-input').value = '';
      switchMessage(window.data.currentChannel, window.data.currentChannelType)
    })
}
document.getElementById('message-input').onkeyup = function(event){if(event.key==='Enter')sendMessage()};
document.getElementById('message-send').onclick = sendMessage;

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
function renderEmbed(embed) {
      /*
application_news
article -
auto_moderation_message
auto_moderation_notification
[
  {
    "type": "auto_moderation_notification",
    "fields": [
      {
        "name": "notification_type",
        "value": "activity_alerts_enabled",
        "inline": false
      },
      {
        "name": "action_by_user_id",
        "value": "816691475844694047",
        "inline": false
      }
    ],
    "content_scan_version": 0
  }
]
gift
gifv -
image -
link -
post_preview
rich -
video -
*/
  let c;
  switch (embed.type) {
    case 'gifv':
      return `<video src="${embed.video.proxy_url}" width="${Math.floor(embed.video.width/2)}" height="${Math.floor(embed.video.height/2)}" muted autoplay loop class="message-attach"></video>`;
    case 'image':
      return `<img src="${embed.thumbnail.proxy_url}" width="${Math.floor(embed.thumbnail.width/2)}" height="${Math.floor(embed.thumbnail.height/2)}" class="message-attach">`;
    case 'article':
    case 'link':
    case 'rich':
    case 'video':
      // TODO: Add very strange thing where if the embed has url it will allow other embeds with only imgase to join up to 4
      c=[embed.title, embed.description, embed?.author?.name, embed?.provider?.name].filter(e=>!!e).length;
      return `<div class="message-rich-embed" style="--embed-color:${colorToRGB(embed.color??0)}">
  ${embed.thumbnail&&embed.type!=='video'?`<img src="${embed.thumbnail.proxy_url}" class="message-attach thumbnail">`:''}
  ${embed?.provider?.name?`<a${embed.provider?.url?` href="${embed.provider.url}"`:''} class="sub">${embed.provider.name}</a>`:''}
  ${embed?.author?.name?`<a${embed.author?.url?` href="${embed.author.url}"`:''} class="sub">${embed.author.proxy_icon_url?`<img src="${embed.author.proxy_icon_url}">`:''}${embed.author.name}</a>`:''}
  ${embed.title?`<a${embed.url?` href="${embed.url}"`:''} class="etitle">${parseMD(embed.title, false)}</a>`:''}
  ${embed.description&&embed.type!=='video'?`<span class="desc">${parseMD(embed.description)}</span>`:''}
  ${embed.fields?`<div class="fields">${embed.fields.map(f=>`<div style="${f.inline?'':'flex:1 1 100%'}">
  <span class="etitle">${parseMD(f.name, false)}</span>
  <span class="desc">${parseMD(f.value)}</span>
</div>`).join('')}</div>`:''}
  ${embed.video?(embed.video.proxy_url?`<video src="${embed.video.proxy_url}" class="message-attach" style="max-width:100%" controls></video>`:`<iframe src="${embed.video.url}" class="message-attach" style="max-width:100%" allow="autoplay" frameborder="0" scrolling="no" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-presentation" allowfullscreen></iframe>`):''}
  ${embed.image&&embed.type!=='video'?`<img src="${embed.image.proxy_url}" class="message-attach" style="max-width:100%;margin-top:${embed.thumbnail?(c>2?'0':(c>1?'15':'40')):'0'}px">`:''}
  ${embed?.footer?.text||embed.timestamp?`<span class="footer">${embed?.footer?.text?`<span class="text">${embed.footer.proxy_icon_url?`<img src="${embed.footer.proxy_icon_url}">`:''}${embed.footer.text}</span>`:''}${embed?.footer?.text&&embed.timestamp?'<span class="dot"></span>':''}${embed.timestamp?`<span>${formatDate(embed.timestamp)}</span>`:''}</span>`:''}
</div>`;
    default:
      report(`Unknown embed type: ${embed.type}`, embed);
      return `<span>Unknown embed type: ${embed.type}</span>`;
  }
}
function renderMessage(content, author, m) {
  return `<div class="message${m.mentions.map(e=>e.id).includes(window.data.user.id)?' mention':''}">
  <img src="${getUserAvatar(author.id, author.avatar)}" width="40" height="40" aria-hidden="true">
  <span>
    <span><span class="name">${author.global_name ?? author.username}</span>${[author.system,m.webhook_id,author.bot].filter(e=>!!e).length?`<span class="tag">${author.system?'SYSTEM':(m.webhook_id?'WEBHOOK':(author.bot?`BOT${getUserFlags(author.flags).VERIFIED_BOT?' ✔':''}`:''))}</span>`:''}<span class="timestamp">${formatDate(m.timestamp, 'r')}</span>${m.edited_timestamp?'<span>· Edited</span>':''}</span>
    <span class="inner">${parseMD(content)}</span>
    ${m.attachments.length?m.attachments.map(attach=>{
      if (!attach.content_type) attach.content_type='image/'+attach.url.split('?')[0].split('.').slice(-1)[0];
      return `<${attach.content_type.startsWith('image/')?'img':attach.content_type.startsWith('audio/')?'audio':attach.content_type.startsWith('video/')?'video':'div'} src="${attach.url}" width="${Math.floor(attach.width/2)}" height="${Math.floor(attach.height/2)}" class="message-attach${attach.flags?(getAttachmentFlags(attach.flags).SPOILER?` spoiler"onclick="this.classList.remove('spoiler')`:''):''}" controls>${attach.content_type.startsWith('image/')?'':attach.content_type.startsWith('audio/')?'</audio>':attach.content_type.startsWith('video/')?'</video>':`<a download="${attach.filename}">${attach.filename}</a></div>`}`;
    }).join(''):''}
    ${m.embeds.length?m.embeds.map(embed=>renderEmbed(embed)).join(''):''}
    ${m.sticker_items?.length?m.sticker_items.map(sticker=>{
      if (sticker.format_type===3) {
        return `<lottie-sticker class="message-attach" data-id="${sticker.id}"></lottie-sticker>`;
      }
      return `<img src="https://media.discordapp.net/stickers/${sticker.id}.${['webp','png','png','webp','gif'][sticker.format_type]}?size=160&quality=lossless" width="160" height="160" class="message-attach">`;
    }).join(''):''}
    ${m.reactions?.length?`<div class="reactions">${m.reactions.map(reaction=>`<button${reaction.me?' class="me"':''}>${reaction.emoji.id?`<img src="https://cdn.discordapp.com/emojis/${reaction.emoji.id}.${reaction.emoji.animated?'gif':'webp'}?size=96">`:twemoji.parse(reaction.emoji.name, twemojiConfig)}${reaction.count}</button>`).join('')}</div>`:''}
  </span>
</div>`;
}
function showMessages(list) {
  document.getElementById('messages').innerHTML = list.map(m=>{
    // System non changing
    if ([14,15,16,17,22].includes(m.type)) {
      const texts = {
        '14': `This server has been removed from Server Discovery because it no longer passes all the requirements. Check Server Settings for more details.`,
        '15': `This server is eligible for Server Discovery again and has been automatically relisted!`,
        '16': `This server has failed Discovery activity requirements for 1 week. If this server fails for 4 weeks in a row, it will be automatically removed from Discovery.`,
        '17': `This server has failed Discovery activity requirements for 3 weeks in a row. If this server fails for 1 more week, it will be removed from Discovery.`,
        '22': `**Wondering who to invite?**\nStart by inviting anyone who can help you build the server!`
      };
      return renderMessage(texts[m.type.toString()], SystemAuthor, m);
    }
    // Group DM/Thread add/remove member
    if ([1,2].includes(m.type)) {
      return renderMessage(`${m.author.global_name ?? m.author.username} ${m.type===1?'added':'removed'} ${m.mentions[0].global_name ?? m.mentions[0].username} ${m.type===1?'to':'from'} the ${window.data.currentChannelType===3?'group':'thread'}.`, SystemAuthor, m);
    }
    // Call
    if (m.type===3) {
      return renderMessage(m.call.ended_timestamp ?
(m.call.participants.includes(window.data.user.id) ?
  `${m.author.global_name ?? m.author.username} started a call that ended.` :
  `You missed a call from ${m.author.global_name ?? m.author.username}.`) :
`${m.author.global_name ?? m.author.username} started a call.`, SystemAuthor, m);
    }
    // User join
    if (m.type===7) {
      const messages = ["{author} joined the party.",
"{author} is here.",
"Welcome, {author}. We hope you brought pizza.",
"A wild {author} appeared.",
"{author} just landed.",
"{author} just slid into the server.",
"{author} just showed up!",
"Welcome {author}. Say hi!",
"{author} hopped into the server.",
"Everyone welcome {author}!",
"Glad you're here, {author}.",
"Good to see you, {author}.",
"Yay you made it, {author}!"];
      return renderMessage(messages[new Date(m.timestamp).getTime()%13].replace('{author}',(m.author.global_name ?? m.author.username)), SystemAuthor, m);
    }
    // Normal
    if (![0,19].includes(m.type)) {
      report(`Unhandled message type: ${m.type}`, m);
      return `<div>Unhandled message type: ${m.type}</div>`;
    }
    return renderMessage(m.content, m.author, m)
  }).join('');
  // Lottie stickers
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
  // Scroll to top
  document.getElementById('messages').scrollTop = 0;
}
function switchMessage(id, type) {
  type = Number(type);
  // How??
  if ([4,7,8].includes(type)) {
    report('User either entered a category or a channel that has not existed for over 3 years?', [id, type])
    return;
  }
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
function setTop(text, type) {
  document.getElementById('top-name').innerHTML = getIcon(type, 20)+text;
}
function showChannels(list, server) {
  let rules;
  if (server) rules = window.data.servers.find(e=>e.id===server).rules_channel_id;
  document.getElementById('channel').innerHTML = (server?'<div id="channels-server-header"></div>':'')+list.map(c=>{
    let name = channelName(c);
    if (c.type===4) {
      return `<span style="color:var(--text-2);font-size:80%;">${name}</span>`
    }
    return `<button data-id="${c.id}" data-type="${c.type}" data-name="${name}">
  ${c.type===1?`<img src="${getUserAvatar(c.recipients[0].id, c.recipients[0].avatar, 32)}" width="20" height="20" aria-hidden="true">`:(rules===c.id?getIcon('rules', 20):getIcon(c.type, 20))}
  <span>${name}</span>
</button>`;
  }).join('');
  Array.from(document.querySelectorAll('#channel button'))
    .forEach(b=>{
      b.onclick = function(){
        loading(b.getAttribute('data-name'));
        setTop(b.getAttribute('data-name'), b.getAttribute('data-type'))
        switchMessage(b.getAttribute('data-id'), b.getAttribute('data-type'));
      }
    });
  // Server banner
  if (server) {
    proxyFetch(`https://discord.com/api/v10/guilds/${server}`)
      .then(res=>res.json())
      .then(res=>{
        let serv = JSON.parse(res.content);
        document.getElementById('channels-server-header').innerHTML = `<span class="name">${serv.name}</span>
${serv.banner?`<div><img src="https://cdn.discordapp.com/banners/${serv.id}/${serv.banner}.webp?size=240"></div>`:''}`;
      })
  }
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
        setTop(channelName(list[0]), list[0].type);
        switchMessage(list[0].id, list[0].type);
      })
  } else if (id == 1) {
    // User
  } else {
    proxyFetch(`https://discord.com/api/v10/guilds/${id}/channels`)
      .then(res=>res.json())
      .then(res=>{
        // Get and sort the channels
        let con = JSON.parse(res.content);
        if (con.code === 50001) {
          alert('Could not access channel');
          reutrn;
        }
        let channels = con.sort((a,b)=>(a.position+([2,13].includes(a.type)?999:0))-(b.position+([2,13].includes(b.type)?999:0)));
        let sorted = [];
        let cat = {'null':[]};
        Object.values(channels.filter(c=>c.type===4).map(c=>c.id)).forEach(id=>cat[id]=[]);
        channels.filter(c=>c.type!==4).forEach(c=>cat[c.parent_id].push(c));
        Object.keys(cat).forEach(k=>{
          if (k!='null') sorted.push(channels.find(cc=>cc.id===k));
          sorted.push(...cat[k]);
        })
        showChannels(sorted, id);
        // Load first
        let first = sorted.filter(c=>c.type!==4)[0];
        loading(channelName(first));
        setTop(channelName(first), first.type);
        switchMessage(first.id, first.type);
      })
  }
}

function showServers(list) {
  document.getElementById('server-list').innerHTML = list.map(s=>{
    if (s?.type==='folder') {
      return `<div aria-label="${s.name??'Folder'}" aria-role="button" class="server-folder" style="--folder-color:${colorToRGB(s.color??0)}">
  <svg onclick="let op=(this.getAttribute('open')==='true');this.setAttribute('open', !op);this.parentElement.style.height=(!op?'${(s.guilds.length+1)*50+s.guilds.length*10}px':'50px')" open="false"${getIcon('folder', 50).replace('<svg','').replace('viewBox="0 0 256 256"','viewBox="-64 -64 384 384"')}
  ${s.guilds.map(g=>`<button aria-label="${g.name}" data-id="${g.id}" class="server-clicky">${g.icon == null ? g.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64" alt="${g.name}">`}</button>`).join('')}
</div>`;
    }
    return `<button aria-label="${s.name}" data-id="${s.id}" class="server-clicky">${s.icon == null ? s.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon}.png?size=64" alt="${s.name}">`}</button>`
  }).join('');
  Array.from(document.querySelectorAll('#server button'))
    .forEach(b=>{
      // On hover
      tippy(b, {
        content: b.getAttribute('aria-label'),
        placement: 'right',
        maxWidth: 200
      })
      // On click
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
      b.oncontextmenu = (event)=>{showContextMenu(event, 'server', {
        id: b.getAttribute('data-id'),
        name: b.getAttribute('aria-label')
      })};
    });
  Array.from(document.querySelectorAll('#server .server-folder'))
    .forEach(b=>{
      tippy(b.children[0], {
        content: b.getAttribute('aria-label'),
        placement: 'right',
        maxWidth: 200
      })
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
  ordered = ordered.filter(e=>!!e);
  showServers(ordered);
}

if (!localStorage.getItem('token')) {
  location.href = '/login';
} else {
  window.data = {};

  window.data.ws = {log:false};
  window.data.localReport = false;

  window.data.servers = [];
  window.data.currentServer = 0;
  window.data.currentChannel = 0;
  window.data.currentChannelType = 0;
  loading('gateway');
  let ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
  function wsheartbeat() {
    ws.send(`{"op":1,"d":${window.data.ws.d}}`);
  }
  ws.onmessage = function(event) {
    let wsd = JSON.parse(event.data);
    if (window.data.ws.log) console.log(wsd);
    switch (wsd.op) {
      case 0: // Just anything
        window.data.ws.d = wsd.s;
        switch (wsd.t) {
          case 'READY':
            init(wsd.d.user, wsd.d.user_settings, wsd.d.guilds)
            break;
        }
        break;
      case 1: // Heartbeat
        wsheartbeat();
        break;
      case 10: // Hewwo
        // Auth
        window.data.ws.heartbeat_interval = wsd.d.heartbeat_interval;
        window.data.ws.d = wsd.s;
        wsheartbeat();
        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: localStorage.getItem('token'),
            properties: {
              os: "windows",
              browser: "chrome"
            },
            compress: false,
            capabilities: 0
          }
        }));
        break;
      case 11: // Heartbeat ACK
        // Wait and heartbeat
        setTimeout(wsheartbeat, window.data.ws.heartbeat_interval);
        break;
      default:
        report('Unknown gateway op: '+wsd.op, wsd)
    }
  }

  async function init(user, settings, guilds) {
    window.data.user = user;
    document.querySelector('#account img').src = getUserAvatar(user.id, user.avatar, 80)

    // TODO: Switch to new settings system
    window.data.settings = settings;

    window.data.servers = guilds;
    await fetchIcon('folder');
    switchServers(guilds);

    loading('icons')
    await Promise.allSettled([
      fetchIcon(0),
      fetchIcon(1),
      fetchIcon(2),
      fetchIcon(3),
      fetchIcon(5),
      fetchIcon(13),
      fetchIcon(15),
      fetchIcon(16),
      fetchIcon('rules')
    ]);

    loading('DMs');
    switchChannel(0);
  }
}