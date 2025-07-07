// Configurations
const twemojiConfig = {
  size: "svg",
  ext: ".svg",
  base: 'https://raw.githubusercontent.com/twitter/twemoji/refs/heads/master/assets/'
};
const userFlags = {
  STAFF: 0n,
  PARTNER: 1n,
  HYPESQUAD: 2n,
  BUG_HUNTER_LEVEL_1: 3n,
  MFA_SMS: 4n,
  PREMIUM_PROMO_DISMISSED: 5n,
  HYPESQUAD_ONLINE_HOUSE_1: 6n,
  HYPESQUAD_ONLINE_HOUSE_2: 7n,
  HYPESQUAD_ONLINE_HOUSE_3: 8n,
  PREMIUM_EARLY_SUPPORTER: 9n,
  TEAM_PSEUDO_USER: 10n,
  INTERNAL_APPLICATION: 11n,
  SYSTEM: 12n,
  HAS_UNREAD_URGENT_MESSAGES: 13n,
  BUG_HUNTER_LEVEL_2: 14n,
  UNDERAGE_DELETED: 15n,
  VERIFIED_BOT: 16n,
  VERIFIED_DEVELOPER: 17n,
  CERTIFIED_MODERATOR: 18n,
  BOT_HTTP_INTERACTIONS: 19n,
  SPAMMER: 20n,
  DISABLE_PREMIUM: 21n,
  ACTIVE_DEVELOPER: 22n,
  PROVISIONAL_ACCOUNT: 23n,
  HIGH_GLOBAL_RATE_LIMIT: 33n,
  DELETED: 34n,
  DISABLED_SUSPICIOUS_ACTIVITY: 35n,
  SELF_DELETED: 36n,
  PREMIUM_DISCRIMINATOR: 37n,
  USED_DESKTOP_CLIENT: 38n,
  USED_WEB_CLIENT: 39n,
  USED_MOBILE_CLIENT: 40n,
  DISABLED: 41n,
  QUARANTINED: 44n,
  COLLABORATOR: 50n,
  RESTRICTED_COLLABORATOR: 51n
};
const messageFlags = {
  CROSSPOSTED: 0n,
  IS_CROSSPOST: 1n,
  SUPPRESS_EMBEDS: 2n,
  SOURCE_MESSAGE_DELETED: 3n,
  URGENT: 4n,
  HAS_THREAD: 5n,
  EPHEMERAL: 6n,
  LOADING: 7n,
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 8n,
  GUILD_FEED_HIDDEN: 9n,
  SHOULD_SHOW_LINK_NOT_DISCORD_WARNING: 10n,
  SUPPRESS_NOTIFICATIONS: 12n,
  IS_VOICE_MESSAGE: 13n,
  HAS_SNAPSHOT: 14n,
  IS_COMPONENTS_V2: 15n,
  SENT_BY_SOCIAL_LAYER_INTEGRATION: 16n
};
const attachmentFlags = {
  CLIP: 0n,
  THUMBNAIL: 1n,
  REMIX: 2n,
  SPOILER: 3n,
  CONTAINS_EXPLICIT_MEDIA: 4n,
  ANIMATED: 5n,
  CONTAINS_GORE_CONTENT: 6n
};
const channelType = {
  invalid: [4,7,8], // These can't be opened or haven't existed for very long
  text: [0,1,3,5,9,10,11,12], // Add 17 when discord releases lobies (they should be a normal text channel?)
  voice: [2,13],
  store: [6],
  forum: [15,16]
};
const SystemAuthor = {
  id: 0,
  avatar: 'system',
  global_name: 'System',
  username: 'system',
  bot: true,
  system: true,
  flags: 4097,
  public_flags: 4097,
  user: {
    id: '0',
    username: 'system',
    discriminator: '0',
    global_name: 'System',
    avatar: 'system',
    avatar_decoration_data: null,
    banner: null,
    banner_color: '#58b9ff',
    accent_color: 5814783,
    bio: 'This is a built-in user account'
  },
  user_profile: {
    pronouns: ''
  },
  badges: [],
  full: true
};
const UnknownAuthor = {
  id: 1,
  avatar: null,
  global_name: 'Deleted User',
  username: 'Deleted User',
  bot: false,
  system: false,
  flags: 0,
  public_flags: 0,
  user: {
    id: '1',
    username: 'Deleted User',
    discriminator: '0000',
    global_name: 'Deleted User',
    avatar: null,
    avatar_decoration_data: null,
    banner: null,
    banner_color: '#58b9ff',
    accent_color: 5814783,
    bio: ''
  },
  user_profile: {
    pronouns: ''
  },
  badges: [],
  full: true
};
// {} gets evaluated, m is the message object
const systemMessages = {
  '1': `{getUserDisplay(m.author)} added {getUserDisplay(m.mentions[0])} to the {channelType===3?'group':'thread'}.`,
  '2': `{getUserDisplay(m.author)} removed {getUserDisplay(m.mentions[0])} from the {channelType===3?'group':'thread'}.`,
  '4': `{getUserDisplay(m.author)} changed the {[15,16].includes(channelType) ? "post title" : "channel name"}: {m.content}`,
  '5': `{getUserDisplay(m.author)} changed the channel icon.`,
  '6': `{getUserDisplay(m.author)} pinned a message to this channel.`,
  '8': `{getUserDisplay(m.author)} just boosted the server{m.content.length?' {{m.content}} times':''}!`,
  '12': `{getUserDisplay(m.author)} has added {m.content} to this channel. Its most important updates will show up here.`,
  '14': `This server has been removed from Server Discovery because it no longer passes all the requirements. Check Server Settings for more details.`,
  '15': `This server is eligible for Server Discovery again and has been automatically relisted!`,
  '16': `This server has failed Discovery activity requirements for 1 week. If this server fails for 4 weeks in a row, it will be automatically removed from Discovery.`,
  '17': `This server has failed Discovery activity requirements for 3 weeks in a row. If this server fails for 1 more week, it will be removed from Discovery.`,
  '18': `{getUserDisplay(m.author)} started a thread: {m.content}. See all threads.`,
  '22': `**Wondering who to invite?**\nStart by inviting anyone who can help you build the server!`,
  '27': `{getUserDisplay(m.author)} started {m.content}`,
  '28': `{getUserDisplay(m.author)} ended {m.content}`,
  '29': `{getUserDisplay(m.author)} is now a speaker.`,
  '30': `{getUserDisplay(m.author)} requested to speak.`,
  '31': `{getUserDisplay(m.author)} changed the Stage topic: {m.content}`,
  '36': `{getUserDisplay(m.author)} enabled security actions until {m.content}.`,
  '37': `{getUserDisplay(m.author)} disabled security actions.`,
  '38': `{getUserDisplay(m.author)} reported a raid in {window.data.servers.find(s=>s.id===window.data.currentServer).name}.`,
  '46': `{getUserDisplay(m.author)}'s poll {m.embeds[0].fields[0].value} has closed.`,
  '55': `{getUserDisplay(m.author)} activated HD Splash Potion`
};
const dateFormats = {
  t: {timeStyle: 'short'},
  T: {timeStyle: 'medium'},
  d: {dateStyle: 'short'},
  D: {dateStyle: 'long'},
  f: {dateStyle: 'long', timeStyle: 'short'},
  F: {dateStyle: 'full', timeStyle: 'short'}
};
function toBinaryString(numString) {
  if (!numString || isNaN(numString)) return "0";
  if (numString === "0") return "0";
  let result = "";
  let dividend = numString;
  while (dividend !== "0") {
    let newDividend = "";
    let carry = 0;
    let leadingZero = true;
    for (let i = 0; i < dividend.length; i++) {
      let current = carry * 10 + parseInt(dividend[i]);
      let quotient = Math.floor(current / 2);
      if (quotient !== 0 || !leadingZero) {
        newDividend += quotient.toString();
        leadingZero = false;
      }
      carry = current % 2;
    }
    result = carry.toString() + result;
    dividend = newDividend.length ? newDividend : "0";
  }
  return result;
}

// Fetching
function proxyFetch(url, o) {
  let opts = {
    method: "GET",
    headers: {
      'accept': '*/*',
      'accept-language': 'en;q=1.0',
      'authorization': localStorage.getItem('token'),
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
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
      "content-type": "application/json"
    },
    body: JSON.stringify(opts),
    signal: AbortSignal.timeout(10000) // 10s max
  })
}

// MD Parse
function parseMD(text, extended=2) {
  let reserve = {};
  function reservemd(txt) {
    let id = Math.floor(Math.random()*Math.pow(10, 16)).toString(10).padStart(16, '0');
    reserve[id] = txt;
    return `¬r${id}¬r`;
  }
  // Escaping + Pre steps
  text = text
    .replaceAll('<', '~lt;')
    .replaceAll('"', '~quot;');
  if (extended>0) {
    text = text.replaceAll(/```([^¬]|¬)*?```/g, function(match){
      match = match
        .replaceAll('&', '&amp;')
        .replaceAll('~lt;', '&lt;')
        .replaceAll('~quot;', '&quot;');
      return reservemd(`<code class="block">${match.slice(3,-3)}</code>`);
    });
  }
  text = text
    .replaceAll(/\[.*?\]\((?:~lt;)?https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)>?\)/g, function(match){
      return reservemd(`<a href="${match.split('](')[1].split(')')[0].replace(/^~lt;|>$/gm, '')}" target="_blank">`)+match.split('](')[0].split('[')[1]+reservemd(`</a>`);
    })
    .replaceAll(/(?:~lt;)?https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)>?/g, function(match){
      if (match.match(/^~lt;.+?>$/m)) match=match.slice(4,-1);
      return reservemd(`<a href="${match}" target="_blank">${match}</a>`);
    })
    .replaceAll('\\&', '&')
    .replaceAll('&', '&amp;')
    .replaceAll('~lt;', '&lt;')
    .replaceAll('~quot;', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll(/\\([^&])/g, function(_, char){return `&#${char.charCodeAt(0)};`})
    .replaceAll(/\`([^¬]|¬)+?\`/g, function(match){return reservemd('<code>'+match.slice(1,-1)+'</code>')});
  // Discord
  text = text
    .replaceAll(/&lt;a?:.+?:[0-9]+?>/g, function(match){
      let parts = match.replace('>','').split(':');
      return reservemd(`<img src="https://cdn.discordapp.com/emojis/${parts[2]}.${parts[0]==='&lt;a'?'gif':'webp'}?size=96" width="18" height="18" loading="lazy" onerror="this.outerText='${match}'" class="emoji">`);
    });
  // General
  text = text
    .replaceAll(/\*\*.+?\*\*/g, function(match){return '<b>'+match.slice(2,-2)+'</b>'})
    .replaceAll(/\*.+?\*/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'})
    .replaceAll(/\_\_.+?\_\_/g, function(match){return '<u>'+match.slice(2,-2)+'</u>'})
    .replaceAll(/\_.+?\_/g, function(match){return '<i>'+match.slice(1,-1)+'</i>'})
    .replaceAll(/\~\~.+?\~\~/g, function(match){return '<s>'+match.slice(2,-2)+'</s>'})
    .replaceAll(/\|\|.+?\|\|/g, function(match){return `<span style="cursor:pointer;color:var(--bg-3);border-radius:0.25rem;background-color:var(--bg-3);transition:500ms;" onclick="this.style.color='var(--text-1)';this.style.backgroundColor='var(--bg-0)'">`+match.slice(2,-2)+'</span>'})
    .replaceAll(/^\>\>\> ([^¬]|¬)+/gm, function(match){return '> '+match.slice(4).split('\n').join('\n> ')});
  // Extended
  if (extended>0) {
    text = text
      .replaceAll(/&lt;t:[0-9]+?(:[tTdDfFR])?>/gm, function(match){match=match.split(':');match[1]=Number(match[1].replace('>',''))*1000;return `<code title="${formatDate(match[1], 'F')}" style="display:unset"${((match[2]??'f')[0])==='R'?` class="timestamp-relative" data-time="${match[1]}"`:''}>${formatDate(match[1], (match[2]??'f')[0])}</code>`})
      .replaceAll(/^(-|\*) .+?$/gm, function(match){return '<li>'+match.slice(2)+'</li>'})
      .replaceAll(/(?:^\d+\. .*(?:\r?\n(?=\d+\. ))?)+/gm, function(match){return '<ol>'+match.replaceAll(/^(.+?)$\n?/gm, function(mat){return`<li>${mat.replace(/^\d+. /m,'')}</li>`})+'</ol>'})
      .replaceAll(/<\/li>\s+?<li>/g,'</li><li>');
    // Discord
    text = text
      //.replaceAll(/(?:&lt;)@\!?[0-9]+?>/gm, function(match){return '<span class="user">@'+getUserDisplay(data.users[match.replaceAll(/^(?:&lt;)@|>$/gm,'')])+'</span>'})
      .replaceAll(/(?:&lt;)@(?:&amp;)[0-9]+?>/gm, function(match){
        let role = window.data.servers.find(s=>s.id===window.data.currentServer).roles.find(r=>r.id===match.replaceAll(/^(?:&lt;)@(?:&amp;)|>$/gm,''));
        if (!role) return reservemd(`<span class="role">@Unknown Role</span>`);
        return reservemd(`<span class="role"${role.color===0?'':` style="--mcol:${colorToRGB(role.color)}"`}>@${role.name}</span>`);
      })
      .replaceAll(/(?:&lt;)#[0-9]+?>/gm, function(match){
        let channel = window.data.servers.find(s=>s.id===window.data.currentServer).channels.find(c=>c.id===match.replaceAll(/^(?:&lt;)#|>$/gm,''));
        if (!channel) return reservemd(`<span class="channel">#Unknown Channel</span>`);
        return reservemd(`<span class="channel" onclick="loading('${channel.name}');setTop('${channel.name}',${channel.type});switchMessage('${channel.id}',${channel.type})">#${channel.name}</span>`);
      });
  }
  if (extended>1) {
    text = text
      .replaceAll(/^(> )?### .+?$/gm, function(match){return (match.startsWith('> ')?'> ':'')+'<span style="font-size:110%">'+match.replace(/^> /m, '').slice(4)+'</span>'})
      .replaceAll(/^(> )?## .+?$/gm, function(match){return (match.startsWith('> ')?'> ':'')+'<span style="font-size:125%">'+match.replace(/^> /m, '').slice(3)+'</span>'})
      .replaceAll(/^(> )?# .+?$/gm, function(match){return (match.startsWith('> ')?'> ':'')+'<span style="font-size:150%">'+match.replace(/^> /m, '').slice(2)+'</span>'})
      .replaceAll(/^(> )?-# .+?$/gm, function(match){return (match.startsWith('> ')?'> ':'')+'<span style="font-size:80%;color:var(--text-2);">'+match.replace(/^> /m, '').slice(3)+'</span>'});
  }
  text = text
    .replaceAll(/^\> .+?$/gm, function(match){return '<blockquote>'+match.slice(2)+'</blockquote>'});
  // Twemojis
  text = text
    .replaceAll(/:[a-zA-Z0-9:_-]+?:/g, function(match){
      if (!window.emoji_colons[match.toLowerCase()]) return match;
      match = window.emoji_colons[match.toLowerCase()];
      return Array.from(match.matchAll(/.{6}/g)).map(part=>String.fromCodePoint(parseInt(part[0],16))).join('')
    });
  text = twemoji.parse(text, twemojiConfig);
  // Reserve
  text = text.replaceAll(/¬r[0-9]{16}¬r/g, function(match){
    let id = match.split('¬r')[1];
    if (reserve[id]) {
      return reserve[id];
    } else {
      return match;
    }
  })
  return text;
}
setInterval(function(){
  Array.from(document.querySelectorAll('.timestamp-relative'))
    .forEach(relative => {
      relative.innerText = formatDate(Number(relative.getAttribute('data-time')), 'R');
    })
}, 1000);

// Icons
const iconCache = {};
function fetchIcon(type) {
  return new Promise((resolve, reject) => {
    fetch(`/media/icon/${type}.svg`)
      .then(res=>res.text())
      .then(res=>{
        iconCache[type] = res;
        resolve();
      })
      .catch(err=>{
        reject()
      });
  })
}
function getIcon(type, size) {
  if (iconCache[type]) {
    return iconCache[type]
      .replace(/width="[0-9]+?"/, `width="${size}"`)
      .replace(/height="[0-9]+?"/, `height="${size}"`);
  } else {
    return '<img>';
  }
}

// Users
function getUser(id) {
  return window.data.users[id];
}
function getUserDisplay(obj) {
  return obj.nick??obj.global_name??obj.display_name??obj.username??obj.user.global_name??obj.user.display_name??obj.user.username;
}
function getUserAvatar(id, hash, size = 64) {
  if (!hash) {
    // Complete mess we have to do cause user ids are very long
    return `https://cdn.discordapp.com/embed/avatars/${Number('0b'+toBinaryString(id).replace(/.{22}$/m,''))%6}.png`;
  }
  if (hash==='system') return '/media/fshcord.png';
  return `https://cdn.discordapp.com/avatars/${id}/${hash}.${hash.startsWith('a_')?'gif':'webp'}?size=${size}`;
}
function getUserBanner(id, hash, color, size = 480) {
  return `<div class="banner" style="--color:${color}">${hash?`<img src="https://cdn.discordapp.com/banners/${id}/${hash}.${hash.startsWith('a_')?'gif':'webp'}?size=${size}" aria-hidden="true">`:''}</div>`
}
function getUserDeco(hash) {
  if (!hash) return '';
  return `https://cdn.discordapp.com/avatar-decoration-presets/${hash}.png?passthrough=true`;
}
function getUserFlags(bitfield) {
  let flags = {};
  bitfield = BigInt(bitfield);
  for (const [name, position] of Object.entries(userFlags)) {
    flags[name] = (bitfield & (1n << position))>0n;
  }
  return flags;
}
function getUserClan(clan, omit=false) {
  if (!clan) return '';
  if (!clan.tag) return '';
  return `<span class="tag"${omit?'':' style="background-color:var(--bg-3)"'}><img src="https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png?size=16" width="12" height="12" inert aria-hidden="true">${clan.tag}</span>`;
}
let UserColorCache = {};
function getUserColor(server, mem) {
  if (!mem?.roles) return '';
  let id = mem.id ?? mem.user.id;
  if (UserColorCache[server]) {
    if (UserColorCache[server][id]) {
      return UserColorCache[server][id];
    } else {
      let c = UserColorCache[server]._roles.filter(rol=>mem.roles.includes(rol.id));
      if (!c[0]) c = [{ color: 10070709 }];
      c = colorToRGB(c[0].color);
      UserColorCache[server][id] = c;
      return c;
    }
  } else {
    UserColorCache[server] = {};
    UserColorCache[server]._roles = window.data.servers
      .find(ser=>ser.id===server).roles
      .filter(rol=>rol.color!==0)
      .toSorted((a,b)=>b.position-a.position);
    return getUserColor(server, mem);
  }
}

// Messages
function getMessageFlags(bitfield) {
  let flags = {};
  bitfield = BigInt(bitfield);
  for (const [name, position] of Object.entries(messageFlags)) {
    flags[name] = (bitfield & (1n << position))>0n;
  }
  return flags;
}
let InviteCache = {};
async function getInvite(code) {
  if (InviteCache[code]) return InviteCache[code];
  let fetc = await proxyFetch(`https://discord.com/api/v10/invites/${code}`);
  fetc = await fetc.json();
  fetc = JSON.parse(fetc.content);
  InviteCache[code] = fetc;
  return fetc;
}

// Attachments
function getAttachmentFlags(bitfield) {
  let flags = {};
  bitfield = BigInt(bitfield);
  for (const [name, position] of Object.entries(attachmentFlags)) {
    flags[name] = (bitfield & (1n << position))>0n;
  }
  return flags;
}
function formatBytes(bytes) {
  bytes = Number(bytes);
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB','RiB','QiB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// General utility
Object.prototype.merge = (a,b)=>{
  Object.keys(b).forEach(k=>a[k]=b[k]);
}
function colorToRGB(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}
function formatDate(date, format='f') {
  if (format==='R') {
    // Relative
    let now = new Date().getTime();
    let da = new Date(date);
    let dat = da.getTime();
    let off = Math.floor((now - dat)/1000);
    if (off === 0) return 'now';
    if (off > 0) {
      if (off < 60) return `${off} seconds ago`;
      if (off < (60 * 60)) return `${Math.floor(off/60)} minutes ago`;
      if (off < (24 * 60 * 60)) return `${Math.floor(off/(60*60))} hours ago`;
      if (off < (2 * 24 * 60 * 60)) return `today at ${da.toLocaleString(navigator, dateFormats.t)}`;
      if (off < (3 * 24 * 60 * 60)) return `yesterday at ${da.toLocaleString(navigator, dateFormats.t)}`;
      if (off < (30 * 24 * 60 * 60)) return `${Math.floor(off/(24*60*60))} days ago`;
      if (off < (365 * 24 * 60 * 60)) return `${Math.floor(off/(30*24*60*60))} months ago`;
      return `${Math.floor(off/(365*24*60*60))} years ago`;
    } else {
      off = off * -1;
      if (off < 60) return `in ${off} seconds`;
      if (off < (60 * 60)) return `in ${Math.floor(off/60)} minutes`;
      if (off < (24 * 60 * 60)) return `in ${Math.floor(off/(60*60))} hours`;
      if (off < (2 * 24 * 60 * 60)) return `today at ${da.toLocaleString(navigator, dateFormats.t)}`;
      if (off < (3 * 24 * 60 * 60)) return `tomorrow at ${da.toLocaleString(navigator, dateFormats.t)}`;
      if (off < (30 * 24 * 60 * 60)) return `in ${Math.floor(off/(24*60*60))} days`;
      if (off < (365 * 24 * 60 * 60)) return `in ${Math.floor(off/(30*24*60*60))} months`;
      return `in ${Math.floor(off/(365*24*60*60))} years`;
    }
  } else if (format==='r') {
    // Short relative (internal)
    let now = new Date().getTime();
    let da = new Date(date);
    let dat = da.getTime();
    let off = Math.floor((now - dat)/1000);
    if (off < (2 * 24 * 60 * 60)) return `today at ${da.toLocaleString(navigator, dateFormats.t)}`;
    if (off < (3 * 24 * 60 * 60)) return `yesterday at ${da.toLocaleString(navigator, dateFormats.t)}`;
    if (off < (30 * 24 * 60 * 60)) return `${Math.floor(off/(24*60*60))} days ago`;
    if (off < (365 * 24 * 60 * 60)) return `${Math.floor(off/(30*24*60*60))} months ago`;
    return `${Math.floor(off/(365*24*60*60))} years ago`;
  } else {
    // Others
    if (!dateFormats[format]) return date;
    return new Date(date).toLocaleString(navigator, dateFormats[format])
  }
}

// Other
function loading(text, empty=false) {
  Toastify({
    text: (empty?'':'Loading ')+text,
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
let lastReport = '';
function report(text, obj) {
  window.data.localReport = true; // TODO: Fix tel
  if (window.data.localReport) {
    console.log(text, obj);
  } else {
    if (lastReport===text) return;
    lastReport = text;
    fetch(`https://telemetry.fsh.plus?url=${encodeURIComponent(location.href)}&text=${text}&context=${encodeURIComponent(JSON.stringify(obj, null, 2))}`, { method: 'POST' })
  }
}
function copy(text) {
  navigator.clipboard.writeText(text);
}