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
13 CALL_CONNECT
14 GUILD_SUBSCRIPTIONS
18 STREAM_CREATE
19 STREAM_DELETE
20 STREAM_WATCH
21 STREAM_PING
22 STREAM_SET_PAUSED
24 REQUEST_GUILD_APPLICATION_COMMANDS
28 REQUEST_FORUM_UNREADS
29 REMOTE_COMMAND
30 GET_DELETED_ENTITY_IDS_NOT_MATCHING_HASH
31 REQUEST_SOUNDBOARD_SOUNDS
34 REQUEST_LAST_MESSAGES
35 SEARCH_RECENT_MEMBERS
36 REQUEST_CHANNEL_STATUSES
37 GUILD_SUBSCRIPTIONS_BULK
38 GUILD_CHANNELS_RESYNC
39 REQUEST_CHANNEL_MEMBER_COUNT
40 QOS_HEARTBEAT
41 UPDATE_TIME_SPENT_SESSION_ID
*/

window.data.ws = { default: 'wss://gateway.discord.gg/?v=10&encoding=json', log: false, logUnhandled: false, socket: undefined, d: undefined, session_id: undefined, resume_url: undefined };

loading('gateway');

function wsstart(url) {
  if (!url) urk = window.data.ws.default;
  let ws = new WebSocket(url);
  window.data.ws.socket = ws;
  ws.onmessage = (evt)=>{wsmessage(JSON.parse(evt.data))};
  ws.onclose = ()=>{
    ws.onmessage = ()=>{};
    ws.onclose = ()=>{};
    wsstart(window.data.ws.resume_url);
  };
}
function wsheartbeat() {
  window.data.ws.socket.send(`{"op":1,"d":${window.data.ws.d}}`);
}
function wsmessage(wsd) {
  if (window.data.ws.log) console.log(wsd);
  switch (wsd.op) {
    case 0: // Just anything
      window.data.ws.d = wsd.s;
      if (wsd.t === 'READY') {// Resume
        window.data.ws.resume_url = wsd.d.resume_gateway_url;
        window.data.ws.session_id = wsd.d.session_id;
        init(wsd.d);
      } else if (wsd.t === 'READY_SUPPLEMENTAL') {// Resume
        wsd.d.merged_presences.guilds.forEach(g=>{
          g.forEach(m=>{
            window.data.presences[m.user_id] = m;
          })
        });
        wsd.d.merged_presences.friends.forEach(m=>{
          window.data.presences[m.user_id] = m;
        });
      } else if (wsd.t === 'GUILD_CREATE') {// Guilds
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
            switchServers();
          })
      } else if (wsd.t === 'GUILD_UPDATE') {
        let temp = window.data.servers.findIndex(s=>s.id===wsd.d.id);
        Object.merge(window.data.servers[temp], wsd.d);
        switchServers();
      } else if (wsd.t === 'GUILD_DELETE') {
        window.data.servers = window.data.servers.filter(e=>e.id!==wsd.d.id);
        window.data.settings.guild_folders.forEach(g=>{
          g.guild_ids = g.guild_ids.filter(s=>s.id!==wsd.d.id);
        });
        window.data.settings.guild_folders = window.data.settings.guild_folders.filter(g=>g.guild_ids.length>0);
        switchServers();
      } else if (wsd.t === 'GUILD_MEMBERS_CHUNK') {
        let temp = window.data.servers[window.data.servers.findIndex(e=>e.id===wsd.d.guild_id)];
        if (!temp.members?.length) temp.members = [];
        temp.members.push(...wsd.d.members);
        temp.members = Array.from(new Map(temp.members.map(obj => [obj.user.id, obj])).values());
        if (window.data.currentServer===wsd.d.guild_id) {
          showMembers(temp.members);
        }
      } else if (wsd.t === 'CHANNEL_UPDATE') {// Channels
        let temp = window.data.servers[window.data.servers.findIndex(e=>e.id===wsd.d.guild_id)];
        temp = temp.channels[temp.channels.findIndex(e=>e.id===wsd.d.id)];
        Object.merge(temp, wsd.d);
        if (window.data.currentServer===wsd.d.guild_id) {
          switchChannel(wsd.d.guild_id, false);
          if (window.data.currentChannel===wsd.d.id) {
            setTop(channelName(wsd.d), wsd.d.type);
          }
        }
      } else if (wsd.t === 'MESSAGE_CREATE') {// Messages
        if (!window.data.messageCache[wsd.d.channel_id]) return;
        // Add to cache
        window.data.messageCache[wsd.d.channel_id].unshift(wsd.d);
        // If current, show new
        if (window.data.currentChannel===wsd.d.channel_id) {
          if (channelType.text.includes(window.data.currentChannelType)) {
            showMessages(window.data.messageCache[wsd.d.channel_id]);
          }
        }
      } else if (wsd.t === 'MESSAGE_UPDATE') {
        if (!window.data.messageCache[wsd.d.channel_id]) return;
        let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.id);
        Object.merge(message, wsd.d);
        // If current, show new
        if (window.data.currentChannel===wsd.d.channel_id) {
          if (channelType.text.includes(window.data.currentChannelType)) {
            showMessages(window.data.messageCache[wsd.d.channel_id]);
          }
        }
      } else if (wsd.t === 'MESSAGE_DELETE') {
        if (!window.data.messageCache[wsd.d.channel_id]) return;
        let message = window.data.messageCache[wsd.d.channel_id].find(m=>m.id===wsd.d.id);
        message.deleted = true;
        // If current, show new
        if (window.data.currentChannel===wsd.d.channel_id) {
          if (channelType.text.includes(window.data.currentChannelType)) {
            showMessages(window.data.messageCache[wsd.d.channel_id]);
          }
        }
      } else if (wsd.t === 'MESSAGE_REACTION_ADD') {
        if (!window.data.messageCache[wsd.d.channel_id]) return;
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
            showMessages(window.data.messageCache[wsd.d.channel_id]);
          }
        }
      } else if (wsd.t === 'MESSAGE_REACTION_REMOVE') {
        if (!window.data.messageCache[wsd.d.channel_id]) return;
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
            showMessages(window.data.messageCache[wsd.d.channel_id]);
          }
        }
      } else if (wsd.t === 'USER_SETTINGS_UPDATE') {// Settings
        Object.merge(window.data.settings, wsd.d);
        if (wsd.d.guild_folders) switchServers();
      } else if (wsd.t === 'USER_SETTINGS_PROTO_UPDATE') {
        // For future
      } else if (wsd.t === 'PRESENCE_UPDATE') {// Presences
        window.data.presences[wsd.d.user.id] = wsd.d
      } else {
        if (window.data.ws.logUnhandled) console.log(wsd);
      }
      break;
    case 1: // Heartbeat
      wsheartbeat();
      break;
    case 7: // About to disconect
      loading('Reconecting socket', true);
      break;
    case 9: // Invalid session
      window.data.ws.resume_url = undefined;
      window.data.ws.session_id = undefined;
      wsstart(window.data.ws.default);
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
            // ^ Consideration: 1 << 9  USER_SETTINGS_PROTO
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

wsstart(window.data.ws.default);

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
  d.users.forEach(u=>{
    if (!window.data.users[u.id]) window.data.users[u.id] = u;
  });
  window.data.users[d.user.id] = d.user;

  // DMs
  window.data.dms = d.private_channels;
  window.data.dms.sort((a,b)=>b.last_message_id-a.last_message_id);

  // Servers
  window.data.servers = d.guilds;
  await fetchIcon('folder');
  switchServers();

  // Channels
  window.data.channelRead = d.read_state;

  // Icons
  if (getIcon(0)==='<img>') {
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
  }

  if (window.data.currentChannel==="0") {
    loading('DMs');
    switchChannel(0);
  }
}