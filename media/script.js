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
    case 'channel':
      menu.innerHTML = `<button onclick="copy('${data.name}')">Copy name</button>
<button onclick="copy('${data.id}')">Copy id</button>`;
      break;
    default:
      menu.innerHTML = 'Error';
      report('Unknown context menu type: '+type, data);
  }
}
window.addEventListener('click', function(){document.getElementById('contextmenu').close()});

let userpopupevent = false;
function handleUserPopupClose(event) {
  let menu = document.getElementById('usermenu');
  if (!menu.open) return;
  let menubound = menu.getBoundingClientRect();
  let isInDialog = (menubound.top <= event.clientY && event.clientY <= menubound.top + menubound.height && menubound.left <= event.clientX && event.clientX <= menubound.left + menubound.width);
  if (!isInDialog) {
    menu.close();
    window.removeEventListener('click', handleUserPopupClose);
    userpopupevent = false;
  }
}
async function showMinifiedProfile(element, user) {
  if (userpopupevent) {
    window.removeEventListener('click', handleUserPopupClose);
    userpopupevent = false;
  }
  // Show modal
  let bound = element.getBoundingClientRect();
  let menu = document.getElementById('usermenu');
  menu.show();
  menu.style.left = bound.left+bound.width+10+'px';
  menu.style.top = bound.top+'px';

  setTimeout(()=>{
    userpopupevent = true;
    window.addEventListener('click', handleUserPopupClose);
  }, 0);

  // Modal content
  menu.innerHTML = "Loading user data...";
  if (!getUser(user)?.full) {
    let usr = await proxyFetch(`https://discord.com/api/v10/users/${user}/profile?type=popout&with_mutual_guilds=true&with_mutual_friends=true&with_mutual_friends_count=false${window.data.currentServer!==0?`&guild_id=${window.data.currentServer}`:''}`);
    usr = await usr.json();
    if (JSON.parse(usr.content).code !== 10013) {
      window.data.users[user] = JSON.parse(usr.content);
      window.data.users[user].full = true;
    } else {
      if (!window.data.users[user]) user = '1';
    }
  }
  user = window.data.users[user];
  menu.innerHTML = `<div>
  <div class="avatar">
    <img src="${getUserAvatar((user.user??user).id, (user.user??user).avatar, 80)}" width="80" height="80" loading="lazy" aria-hidden="true" style="border-radius:5rem">
    <img src="${getUserDeco((user.user??user)?.avatar_decoration_data?.asset)}" class="decoration" width="100" height="100" loading="lazy" aria-hidden="true" onerror="this.remove()">
    <div class="badges">
      ${user.user?'':'<img src="/media/icon/limited.svg" width="25" height="25" alt="This profile has limited info" title="This profile has limited info">'}
      ${(user.badges??[]).map(b=>`<a${b.link?` href="${b.link}"`:''} target="_blank" title="${b.description}" aria-hidden="true"><img src="https://cdn.discordapp.com/badge-icons/${b.icon}.png" width="25" height="25" alt="${b.description}" aria-hidden="true"></a>`).join('')}
    </div>
  </div>
  ${getUserBanner((user.user??user).id, user?.user?.banner, user?.user?.banner_color??colorToRGB(user?.user?.accent_color??0))}
</div>
<div class="name">
  <b>${getUserDisplay(user.user??user)}</b>
  <span>${(user.user??user).username}${user?.user?.discriminator?.length>1?'#'+user.user.discriminator:''}${user?.user_profile?.pronouns?` · ${user.user_profile.pronouns}`:''}</span>
</div>
<span class="bio">${user?.user?.bio?parseMD(user.user.bio.trim(), 1):''}</span>`;
  let menubound = menu.getBoundingClientRect();
  if (window.innerHeight<menubound.bottom) {
    menu.style.top = bound.top-(menubound.bottom-window.innerHeight)+'px';
  }
}

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
      window.data.channelTyping[window.data.currentChannel] = 0;
    })
}
document.getElementById('message-input').onkeyup = function(event){
  if (event.key==='Enter') sendMessage();
  let last = window.data.channelTyping[window.data.currentChannel] ?? 0;
  if (Date.now() > last+(10 * 1000)) {
    window.data.channelTyping[window.data.currentChannel] = Date.now();
    proxyFetch(`https://discord.com/api/v10/channels/${window.data.currentChannel}/typing`, { method: 'POST' })
  }
};
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
56: CHAT_WALLPAPER_SET
57: CHAT_WALLPAPER_REMOVED
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
poll_result -
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
    case 'poll_result':
      return `<div class="message-rich-embed message-poll-result">
  ${embed.fields[5]?.value?`<span>${embed.fields[5].value}</span>`:''}
  <div>
    <span>${embed.fields[3]?.value?embed.fields[4].value+' ✓':'The results were tied'}</span>
    <span class="small">${embed.fields[3]?.value?'Winning answer • ':''}${(embed.fields[1].value/embed.fields[2].value*100).toFixed(2).replace('.00','')}%</span>
  </div>
</div>`;
    case 'article':
    case 'link':
    case 'rich':
    case 'video':
      // TODO: Add very strange thing where if the embed has url it will allow other embeds with only images to join up to 4
      c=[embed.title, embed.description, embed?.author?.name, embed?.provider?.name].filter(e=>!!e).length;
      return `<div class="message-rich-embed" style="--embed-color:${colorToRGB(embed.color??0)}">
  ${embed.thumbnail&&embed.type!=='video'?`<img src="${embed.thumbnail.proxy_url}" class="message-attach thumbnail">`:''}
  ${embed?.provider?.name?`<a${embed.provider?.url?` href="${embed.provider.url}"`:''} class="sub">${embed.provider.name}</a>`:''}
  ${embed?.author?.name?`<a${embed.author?.url?` href="${embed.author.url}"`:''} class="sub">${embed.author.proxy_icon_url?`<img src="${embed.author.proxy_icon_url}">`:''}${embed.author.name}</a>`:''}
  ${embed.title?`<a${embed.url?` href="${embed.url}"`:''} class="etitle">${parseMD(embed.title, 0)}</a>`:''}
  ${embed.description&&embed.type!=='video'?`<span class="desc">${parseMD(embed.description)}</span>`:''}
  ${embed.fields?`<div class="fields">${embed.fields.map(f=>`<div style="${f.inline?'':'flex:1 1 100%'}">
  <span class="etitle">${parseMD(f.name, 0)}</span>
  <span class="desc">${parseMD(f.value)}</span>
</div>`).join('')}</div>`:''}
  ${embed.video?(embed.video.proxy_url?`<video src="${embed.video.proxy_url}" class="message-attach" style="max-width:100%" controls></video>`:`<iframe src="${embed.video.url}" class="message-attach" allow="autoplay" frameborder="0" scrolling="no" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-presentation" allowfullscreen></iframe>`):''}
  ${embed.image&&embed.type!=='video'?`<img src="${embed.image.proxy_url}" class="message-attach big" style="max-width:100%;margin-top:${embed.thumbnail?(c>2?'0':(c>1?'15':'40')):'0'}px">`:''}
  ${embed?.footer?.text||embed.timestamp?`<span class="footer">${embed?.footer?.text?`<span class="text">${embed.footer.proxy_icon_url?`<img src="${embed.footer.proxy_icon_url}">`:''}${embed.footer.text}</span>`:''}${embed?.footer?.text&&embed.timestamp?'<span class="dot"></span>':''}${embed.timestamp?`<span>${formatDate(embed.timestamp)}</span>`:''}</span>`:''}
</div>`;
    default:
      report(`Unknown embed type: ${embed.type}`, embed);
      return `<span>Unknown embed type: ${embed.type}</span>`;
  }
}
function renderMessage(content, author, m) {
  return `<div class="message${m.deleted?' deleted':''}${m.mentions.map(e=>e.id).includes(window.data.user.id)?' mention':''}">
  ${author.hide?'<div class="avatar" aria-hidden="true"></div>':`<div class="avatar" aria-hidden="true" onclick="showMinifiedProfile(this, '${author.id}')">
    <img src="${getUserAvatar(author.id, author.avatar)}" width="40" height="40" loading="lazy" aria-hidden="true">
    <img src="${getUserDeco(author?.avatar_decoration_data?.asset)}" class="decoration" width="50" height="50" loading="lazy" aria-hidden="true" onerror="this.remove()">
  </div>`}
  <span>
    ${author.hide?'':`<span><span class="name" onclick="showMinifiedProfile(this, '${author.id}')">${getUserDisplay(author)}</span>${[author.system,m.webhook_id,author.bot].filter(e=>!!e).length?`<span class="tag">${author.system?'SYSTEM':(m.webhook_id?'WEBHOOK':(author.bot?`BOT${getUserFlags(author.flags??author.public_flags).VERIFIED_BOT?' ✔':''}`:''))}</span>`:''}<span class="timestamp">${formatDate(m.timestamp, 'r')}</span>${getUserFlags(author.flags??author.public_flags).SPAMMER?'<span>· Possible spammer</span>':''}</span>`}
    <span class="inner">${parseMD(content)}${m.edited_timestamp?'<span class="edited"> (edited)</span>':''}</span>
    ${m.attachments.length?m.attachments.map(attach=>{
      if (!attach.content_type) attach.content_type=`image/${attach.url.split('?')[0].split('.').slice(-1)[0]}`;
      if (attach.content_type.startsWith('image')&&!attach.width) attach.content_type=`application/${attach.content_type.split('/')[1]}`;
      return `<${attach.content_type.startsWith('image/')?'img':attach.content_type.startsWith('audio/')?'audio':attach.content_type.startsWith('video/')?'video':'div'} src="${attach.url}" width="${Math.floor(attach.width/2)}" height="${Math.floor(attach.height/2)}" class="message-attach${attach.flags?(getAttachmentFlags(attach.flags).SPOILER?` spoiler"onclick="this.classList.remove('spoiler')`:''):''}" controls>${attach.content_type.startsWith('image/')?'':attach.content_type.startsWith('audio/')?'</audio>':attach.content_type.startsWith('video/')?'</video>':`<a download="${attach.filename}">${attach.filename}</a> · ${formatBytes(attach.size)}</div>`}`;
    }).join(''):''}
    ${m.embeds.length?m.embeds.map(embed=>renderEmbed(embed)).join(''):''}
    ${m.sticker_items?.length?m.sticker_items.map(sticker=>{
      if (sticker.format_type===3) {
        return `<lottie-sticker class="message-attach" data-id="${sticker.id}"></lottie-sticker>`;
      }
      return `<img src="https://media.discordapp.net/stickers/${sticker.id}.${['webp','png','png','webp','gif'][sticker.format_type]}?size=160&quality=lossless" width="160" height="160" loading="lazy" class="message-attach">`;
    }).join(''):''}
    ${m.reactions?.length?`<div class="reactions">${m.reactions.map(reaction=>`<button${reaction.me?' class="me"':''}>${reaction.emoji.id?`<img src="https://cdn.discordapp.com/emojis/${reaction.emoji.id}.${reaction.emoji.animated?'gif':'webp'}?size=96" width="16" height="16" loading="lazy">`:twemoji.parse(reaction.emoji.name, twemojiConfig)}${reaction.count}</button>`).join('')}</div>`:''}
  </span>
</div>`;
}
function showMessages(list, channelType) {
  document.getElementById('messages').innerHTML = list.map((m,i,a)=>{
    // System
    if (systemMessages[m.type.toString()]) {
      let text = systemMessages[m.type.toString()].replaceAll(/\{.*?\}/g, function(match){return eval(match)});
      return renderMessage(text, SystemAuthor, m);
    }
    // Group DM/Thread add/remove member
    if ([1,2].includes(m.type)) {
      return renderMessage(`${getUserDisplay(m.author)} ${m.type===1?'added':'removed'} ${getUserDisplay(m.mentions[0])} ${m.type===1?'to':'from'} the ${channelType===3?'group':'thread'}.`, SystemAuthor, m);
    }
    // Call
    if (m.type===3) {
      return renderMessage(m.call.ended_timestamp ?
(m.call.participants.includes(window.data.user.id) ?
  `${getUserDisplay(m.author)} started a call that ended.` :
  `You missed a call from ${getUserDisplay(m.author)}.`) :
`${getUserDisplay(m.author)} started a call.`, SystemAuthor, m);
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
      return renderMessage(messages[new Date(m.timestamp).getTime()%13].replace('{author}',(getUserDisplay(m.author))), SystemAuthor, m);
    }
    // Normal
    if (![0,19].includes(m.type)) {
      report(`Unhandled message type: ${m.type}`, m);
      return `<div>Unhandled message type: ${m.type}</div>`;
    }
    let auth = m.author;
    if (a[i+1]?.author?.id===auth.id) {
      auth.hide = true;
      if ((new Date(m.timestamp).getTime()-new Date(a[i+1].timestamp).getTime())>(8*60*1000)) auth.hide = false;
    }
    if ([19].includes(m.type)) auth.hide = false;
    return renderMessage(m.content, auth, m)
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
  if (channelType.invalid.includes(type)) {
    report('User either entered a category or a channel that has not existed for over 3 years?', [id, type])
    return;
  }
  // Set current
  this.data.currentChannel = id;
  this.data.currentChannelType = type;
  // Text
  if (channelType.text.includes(type)) {
    if (window.data.messageCache[id]) {
      showMessages(window.data.messageCache[id], type);
      return;
    }
    showMessages([], type);
    proxyFetch(`https://discord.com/api/v10/channels/${id}/messages?limit=50`)
      .then(res=>res.json())
      .then(res=>{
        let con = JSON.parse(res.content);
        if (con.code === 50001) {
          alert('Could not access channel');
          return;
        }
        window.data.messageCache[id] = con;
        showMessages(con, type);
      })
    return;
  }/*
  // Voice
  if (channelType.voice.includes(type)) {
    return;
  }
  // Store
  if (channelType.store.includes(type)) {
    return;
  }
  // Forum
  if (channelType.forum.includes(type)) {
    return;
  }*/
  report(`Unhandled channel type: ${type}`, [id, type]);
}

/*
Channel types
0: GUILD_TEXT -
1: DM -
2: GUILD_VOICE
3: GROUP_DM -
4: GUILD_CATEGORY -
5: GUILD_NEWS -
6: GUILD_STORE
7: GUILD_LFG x
8: LFG_GROUP_DM x
9: THREAD_ALPHA
10: NEWS_THREAD -
11: PUBLIC_THREAD -
12: PRIVATE_THREAD -
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
    name = getUserDisplay(getUser(c.recipient_ids[0]));
  } else if (c.type === 3) {
    name = c.name ?? (c.recipient_ids.map(r=>getUserDisplay(getUser(r))).join(', '));
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
  if (server) {
    server = window.data.servers.find(e=>e.id===server);
    // Rules
    rules = server.rules_channel_id;
  }
  document.getElementById('channel').innerHTML = (server?'<div id="channels-server-header"></div>':'')+list.map(c=>{
    let name = channelName(c);
    if (c.type===4) {
      return `<span style="color:var(--text-2);font-size:80%;">${name}</span>`
    }
    return `<button data-id="${c.id}" data-type="${c.type}" data-name="${name}">
  ${c.type===1&&window.data.extra_settings.nameplates&&getUser(c.recipient_ids[0]).collectibles?.nameplate?`<video class="nameplate" src="https://cdn.discordapp.com/assets/collectibles/${getUser(c.recipient_ids[0]).collectibles.nameplate.asset}asset.webm" muted loop aria-hidden="true"></video>`:''}
  ${c.type===1?`<div class="avatar" aria-hidden="true"><img src="${getUserAvatar(c.recipient_ids[0], getUser(c.recipient_ids[0]).avatar, 32)}" width="20" height="20" loading="lazy" aria-hidden="true">${c.type===1&&window.data.extra_settings.avatar_deco?`<img src="${getUserDeco(getUser(c.recipient_ids[0])?.avatar_decoration_data?.asset)}" class="decoration" width="25" height="25" loading="lazy" aria-hidden="true" onerror="this.remove()">`:''}</div>`:''}
  ${c.type!==1?(rules===c.id?getIcon('rules', 20):getIcon(c.type, 20)):''}
  ${c.nsfw?getIcon('nsfw', 20).replace('>',' class="channel-nsfw">'):''}
  <span>${name}</span>
</button>`;
  }).join('');
  Array.from(document.querySelectorAll('#channel button'))
    .forEach(b=>{
      b.onclick = function(){
        loading(b.getAttribute('data-name'));
        setTop(b.getAttribute('data-name'), b.getAttribute('data-type'))
        switchMessage(b.getAttribute('data-id'), b.getAttribute('data-type'));
      };
      b.oncontextmenu = (event)=>{showContextMenu(event, 'channel', {
        id: b.getAttribute('data-id'),
        name: b.getAttribute('data-name')
      })};
      let n = b.querySelector('.nameplate');
      if (n) {
        n.onmouseenter = ()=>{n.play()};
        n.onmouseleave = ()=>{n.pause();n.currentTime=0};
      }
    });
  if (server) {
    // Server banner
    document.getElementById('channels-server-header').innerHTML = `<span class="name">${server.name??server.properties.name}</span>
${(server.banner??server.properties.banner)?`<div><img src="https://cdn.discordapp.com/banners/${server.id}/${server.banner??server.properties.banner}.webp?size=240"></div>`:''}`;
  }
}
function switchChannel(id) {
  if (id == 0) {
    // Show channels
    showChannels(window.data.dms);
    // Select first
    let first = window.data.dms[0];
    loading(channelName(first));
    setTop(channelName(first), first.type);
    switchMessage(first.id, first.type);
  } else if (id == 1) {
    // User
  } else {
    let server = window.data.servers.find(e=>e.id===id);
    // Get and sort the channels
    let channels = structuredClone(server.channels).sort((a,b)=>(a.position+([2,13].includes(a.type)?999:0))-(b.position+([2,13].includes(b.type)?999:0)));
    let sorted = [];
    let cat = {'':[]};
    Object.values(channels.filter(c=>c.type===4).map(c=>c.id)).forEach(id=>cat[id]=[]);
    channels.filter(c=>c.type!==4).forEach(c=>cat[c.parent_id??''].push(c));
    Object.keys(cat).forEach(k=>{
      if (k!='') sorted.push(channels.find(cc=>cc.id===k));
      sorted.push(...cat[k]);
    });
    showChannels(sorted, id);
    // Load first
    let first = sorted.filter(c=>c.type!==4)[0];
    loading(channelName(first));
    setTop(channelName(first), first.type);
    switchMessage(first.id, first.type);
  }
}

function showServers(list) {
  document.getElementById('server-list').innerHTML = list.map(s=>{
    if (s?.type==='folder') {
      return `<div aria-label="${s.name??'Folder'}" aria-role="button" class="server-folder" style="--folder-color:${colorToRGB(s.color??1579032)}">
  <svg onclick="let op=(this.getAttribute('open')==='true');this.setAttribute('open', !op);this.parentElement.style.height=(!op?'${(s.guilds.length+1)*50+s.guilds.length*10}px':'50px')" open="false"${getIcon('folder', 50).replace('<svg','').replace('viewBox="0 0 256 256"','viewBox="-64 -64 384 384"')}
  ${s.guilds.map(g=>`<button aria-label="${g.properties.name}" data-id="${g.id}" class="server-clicky">${g.properties.icon == null ? g.properties.name.trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.properties.icon}.png?size=64" alt="${g.properties.name}" loading="lazy">`}</button>`).join('')}
</div>`;
    }
    return `<button aria-label="${s.name??s?.properties?.name??'Server'}" data-id="${s.id}" class="server-clicky">${(s.icon??s?.properties?.icon??null) == null ? (s.name??s?.properties?.name??'Server').trim().split(/\s+/).map(word=>word[0]??'').join('') : `<img src="https://cdn.discordapp.com/icons/${s.id}/${s.icon??s.properties.icon}.png?size=64" alt="${s.name??s?.properties?.name??'Server'}" loading="lazy">`}</button>`;
  }).join('');
  Array.from(document.querySelectorAll('#server button'))
    .forEach(b=>{
      // On hover
      tippy(b, {
        content: b.getAttribute('aria-label'),
        placement: 'right',
        maxWidth: 200
      });
      // On click
      b.onclick = function(){
        let sid = b.getAttribute('data-id');
        // Set selected
        let previous = document.querySelector('#server button[selected]');
        if (!b.isSameNode(previous)) {
          previous?.classList?.add('leaving');
          setTimeout(() => {
            previous?.classList?.remove('leaving');
            previous?.removeAttribute('selected');
          }, 250);
          b.setAttribute('selected', true);
        }
        // Switch the server and show channels
        loading(b.getAttribute('aria-label'));
        window.data.currentServer = sid;
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
  document.querySelector('#server button[selected]')?.removeAttribute('selected');
  document.querySelector('#server button[data-id="'+window.data.currentServer+'"]').setAttribute('selected', true);
}
function switchServers(list) {
  let ordered = [];
  window.data.settings.guild_folders.forEach(f => {
    if (f.guild_ids.length<2) {
      let g = list.find(s=>s.id===f.guild_ids[0]);
      if (g) ordered.push(g);
    } else {
      let gs = f.guild_ids.map(g=>list.find(s=>s.id===g)).filter(e=>!!e);
      ordered.push({
        type: 'folder',
        id: f.id,
        name: f.name,
        color: f.color,
        guilds: gs
      })
    }
  });
  showServers(ordered);
}

/* Gateway ops
0 DISPATCH
1 HEARTBEAT
2 IDENTIFY
3 PRESENCE_UPDATE
4 VOICE_STATE_UPDATE
5 VOICE_SERVER_PING
6 RESUME
7 RECONNECT
8 REQUEST_GUILD_MEMBERS
9 INVALID_SESSION
10 HELLO
11 HEARTBEAT_ACK
12 ?
13 CALL_CONNECT
14 GUILD_SUBSCRIPTIONS
15 ?
16 ?
17 ?
18 STREAM_CREATE
19 STREAM_DELETE
20 STREAM_WATCH
21 STREAM_PING
22 STREAM_SET_PAUSED
23 ?
24 REQUEST_GUILD_APPLICATION_COMMANDS
25 ?
26 ?
27 ?
28 REQUEST_FORUM_UNREADS
29 REMOTE_COMMAND
30 GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH
31 REQUEST_SOUNDBOARD_SOUNDS
32 ?
33 ?
34 REQUEST_LAST_MESSAGES
35 SEARCH_RECENT_MEMBERS
36 REQUEST_CHANNEL_STATUSES
37 GUILD_SUBSCRIPTIONS_BULK
38 GUILD_CHANNELS_RESYNC
39 REQUEST_CHANNEL_MEMBER_COUNT
*/
if (!localStorage.getItem('token')) {
  location.href = '/login';
} else {
  window.data = {};
  window.data.localReport = false;

  window.data.extra_settings = {
    avatar_deco: true,
    nameplates: true
  };
  try {
    let s = JSON.parse(localStorage.getItem('extra'));
    Object.keys(s).forEach(k=>window.data.extra_settings[k]=s[k]);
  } catch(err) {
    // Ignore :3
  }

  window.data.ws = { log: false, logUnhandled: false, socket: undefined, d: undefined, session_id: undefined, resume_url: undefined };

  window.data.users = {};
  window.data.presences = {};
  window.data.servers = [];
  window.data.dms = [];

  window.data.messageCache = {};
  window.data.channelTyping = {};

  window.data.currentServer = 0;
  window.data.currentChannel = 0;
  window.data.currentChannelType = 0;

  loading('gateway');
  let ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
  let nws;
  window.data.ws.socket = ws;
  function wsheartbeat() {
    window.data.ws.socket.send(`{"op":1,"d":${window.data.ws.d}}`);
  }
  window.data.ws.socket.onmessage = function(event) {
    let wsd = JSON.parse(event.data);
    if (window.data.ws.log) console.log(wsd);
    let temp;
    switch (wsd.op) {
      case 0: // Just anything
        window.data.ws.d = wsd.s;
        switch (wsd.t) {
          case 'READY':
            // Resume
            window.data.ws.resume_url = wsd.d.resume_gateway_url;
            window.data.ws.session_id = wsd.d.session_id;
            init(wsd.d);
            break;
          case 'READY_SUPPLEMENTAL':
            // Resume
            wsd.d.merged_presences.guilds.forEach(g=>{
              g.forEach(m=>{
                window.data.presences[m.user_id] = m;
              })
            })
            break;

          case 'GUILD_CREATE':
            proxyFetch(`https://discord.com/api/v10/guilds/${wsd.d.id}`)
              .then(res=>res.json())
              .then(res=>{
                let con = JSON.parse(res.content);
                window.data.servers.push(con);
                window.data.settings.guild_folders.unshift({
                  id: null,
                  name: null,
                  color: null,
                  guild_ids: [con.id]
                });
                switchServers(window.data.servers);
              })
            break;
          case 'GUILD_UPDATE':
            temp = window.data.servers.findIndex(e=>e.id===wsd.d.id);
            Object.keys(wsd.d).forEach(k=>window.data.servers[temp][k]=wsd.d[k]);
            switchServers(window.data.servers);
            break;
          case 'GUILD_DELETE':
            window.data.servers = window.data.servers.filter(e=>e.id!==wsd.d.id);
            switchServers(window.data.servers);
            break;/*
          case 'GUILD_MEMBERS_CHUNK':
            window.data.servers[window.data.servers.findIndex(e=>e.id===wsd.d.guild_id)].members = wsd.d.members;
            break;*/

          case 'CHANNEL_UPDATE':
            temp = window.data.servers[window.data.servers.findIndex(e=>e.id===wsd.d.guild_id)];
            temp = temp.channels[temp.channels.findIndex(e=>e.id===wsd.d.id)];
            Object.keys(wsd.d).forEach(k=>temp[k]=wsd.d[k]);
            if (window.data.currentServer===wsd.d.guild_id) {
              switchChannel(wsd.d.guild_id);
            }
            break;

          case 'MESSAGE_CREATE':
            if (window.data.messageCache[wsd.d.channel_id]) {
              // Add to cache
              window.data.messageCache[wsd.d.channel_id].unshift(wsd.d);
              // If current, show new
              if (window.data.currentChannel===wsd.d.channel_id) {
                if (channelType.text.includes(window.data.currentChannelType)) {
                  showMessages(window.data.messageCache[wsd.d.channel_id], window.data.currentChannelType);
                }
              }
            }
            break;
          case 'MESSAGE_UPDATE':
            if (window.data.messageCache[wsd.d.channel_id]) {
              let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.id);
              Object.keys(wsd.d).forEach(k=>message[k]=wsd.d[k]);
              // If current, show new
              if (window.data.currentChannel===wsd.d.channel_id) {
                if (channelType.text.includes(window.data.currentChannelType)) {
                  showMessages(window.data.messageCache[wsd.d.channel_id], window.data.currentChannelType);
                }
              }
            }
            break;
          case 'MESSAGE_DELETE':
            if (window.data.messageCache[wsd.d.channel_id]) {
              let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.id);
              message.deleted = true;
              // If current, show new
              if (window.data.currentChannel===wsd.d.channel_id) {
                if (channelType.text.includes(window.data.currentChannelType)) {
                  showMessages(window.data.messageCache[wsd.d.channel_id], window.data.currentChannelType);
                }
              }
            }
            break;
          case 'MESSAGE_REACTION_ADD':
            if (window.data.messageCache[wsd.d.channel_id]) {
              let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.message_id);
              let same = message.reactions.find(r=>r.emoji.id==wsd.d.emoji.id&&r.emoji.name===wsd.d.emoji.name);
              if (same) {
                // Count up
                same.count += 1;
                if (wsd.d.type===0) {
                  same.count_details.normal += 1;
                } else {
                  same.count_details.burst += 1;
                }
                // If user set me :3
                if (wsd.d.user_id===window.data.user.id) {
                  same.me = true;
                  same.me_burst = (wsd.d.type===1);
                }
              } else {
                // New reaction
                message.reactions.push({
                  count: 1,
                  count_details: {
                    normal: wsd.d.type^1,
                    burst: wsd.d.type
                  },
                  emoji: wsd.d.emoji,
                  burst_colors: [],
                  me: (wsd.d.user_id===window.data.user.id),
                  me_burst: (wsd.d.type===1)&&(wsd.d.user_id===window.data.user.id)
                })
              }
              // If current, show new
              if (window.data.currentChannel===wsd.d.channel_id) {
                if (channelType.text.includes(window.data.currentChannelType)) {
                  showMessages(window.data.messageCache[wsd.d.channel_id], window.data.currentChannelType);
                }
              }
            }
            break;
          case 'MESSAGE_REACTION_REMOVE':
            if (window.data.messageCache[wsd.d.channel_id]) {
              let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.message_id);
              let same = message.reactions.find(r=>r.emoji.id==wsd.d.emoji.id&&r.emoji.name===wsd.d.emoji.name);
              if (same) {
                // Count down
                same.count -= 1;
                if (wsd.d.type===0) {
                  same.count_details.normal -= 1;
                } else {
                  same.count_details.burst -= 1;
                }
                if (wsd.d.user_id===window.data.user.id) {
                  same.me = false;
                  same.me_burst = false;
                }
                // If count 0 remove
                if (same.count<1) {
                  message.reactions = message.reactions.filter(r=>r.emoji.id!=wsd.d.emoji.id||r.emoji.name!==wsd.d.emoji.name);
                }
              }
              // If current, show new
              if (window.data.currentChannel===wsd.d.channel_id) {
                if (channelType.text.includes(window.data.currentChannelType)) {
                  showMessages(window.data.messageCache[wsd.d.channel_id], window.data.currentChannelType);
                }
              }
            }
            break;

          case 'USER_SETTINGS_UPDATE':
            Object.entries(wsd.d).forEach((k,v)=>{
              window.data.settings[k] = v;
            });
            if (wsd.d.guild_folders) switchServers(window.data.servers);
            break;
          case 'USER_SETTINGS_PROTO_UPDATE':
            // For future
            break;

          case 'PRESENCE_UPDATE':
            window.data.presences[wsd.d.user.id] = wsd.d
            break;

          default:
            if (window.data.ws.logUnhandled) console.log(wsd);
            break;
        }
        break;
      case 1: // Heartbeat
        wsheartbeat();
        break;
      case 7: // About to disconect
        window.data.ws.socket.onclose = function() {
          nws = new WebSocket(window.data.ws.resume_url);
          nws.onmessage = window.data.ws.socket.onmessage;
          window.data.ws.socket = nws;
        }
        break;
      case 9: // Invalid session
        window.data.ws.resume_url = undefined;
        window.data.ws.session_id = undefined;
        nws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
        nws.onmessage = window.data.ws.socket.onmessage;
        window.data.ws.socket = nws;
        break;
      case 10: // Hewwo
        window.data.ws.heartbeat_interval = wsd.d.heartbeat_interval;
        // Have we been here before?
        if (window.data.ws.session_id) {
          // Resume
          window.data.ws.socket.send(JSON.stringify({
            op: 6,
            d: {
              token: localStorage.getItem('token'),
              session_id: window.data.ws.session_id,
              seq: window.data.ws.d
            }
          }));
        } else {
          // Auth
          window.data.ws.d = wsd.s;
          wsheartbeat();
          window.data.ws.socket.send(JSON.stringify({
            op: 2,
            d: {
              token: localStorage.getItem('token'),
              properties: {
                os: "windows",
                browser: "chrome"
              },
              compress: false,
              capabilities: (1<<0)+(1<<4)+(1<<5)+(1<<10)+(1<<13) // Lazy notes, dedupe user objects, prioritizied ready payload, client state v2, debounce message reactions
              // ^ Consideration: 1 << 9	USER_SETTINGS_PROTO
            }
          }));
        }
        break;
      case 11: // Heartbeat ACK
        // Wait and heartbeat
        setTimeout(wsheartbeat, window.data.ws.heartbeat_interval);
        break;
      default:
        report('Unknown gateway op: '+wsd.op, wsd)
    }
  }

  async function init(d) {
    // User
    window.data.user = d.user;
    document.querySelector('#account img').src = getUserAvatar(d.user.id, d.user.avatar, 80);
    window.data.settings = d.user_settings; // TODO: Switch to new settings system

    // User relationships
    window.data.relationships = {};
    d.relationships.forEach(r=>{
      window.data.relationships[r.id??r.user_id] = {
        nick: r.nickname,

        friend: (r.type===1),
        ignored: r.user_ignored,
        blocked: (r.type===2),
        implicit: (r.type===5),
        suggestion: (r.type===6), // Deprecated

        in_req: (r.type===3),
        out_req: (r.type===4),
        spam_req: r.is_spam_request??false,
        stranger_req: r.stranger_request??false,

        since: r.since??null
      };
    });

    // Users
    d.users.forEach(u=>window.data.users[u.id]=u);
    window.data.users[d.user.id] = d.user;
    window.data.users['0'] = SystemAuthor;
    window.data.users['1'] = UnknownAuthor;

    // DMs
    window.data.dms = d.private_channels;
    window.data.dms.sort((a,b)=>b.last_message_id-a.last_message_id);

    // Servers
    window.data.servers = d.guilds;
    await fetchIcon('folder');
    switchServers(d.guilds);

    // Channels
    window.data.channelRead = d.read_state;

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
      fetchIcon('rules'),
      fetchIcon('nsfw')
    ]);

    loading('DMs');
    switchChannel(0);
  }
}