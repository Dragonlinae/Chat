// vars
var global_badges = {};
var channel_id = 0;

// main init

var TC = new TwitchChat("Dragonlinae");
TC.OnReady = function () {
  channel_id = this.channel_id;
  load_badges();
}
var TC2 = new TwitchChat("avocadoplux");
TC2.OnReady = function () {
  channel_id = this.channel_id;
  load_badges();
}
// generators

function display_message(message) {

  var message_space = document.getElementById('message_space');
  var html_message = generate_message(message);

  message_space.appendChild(html_message);
  if (message_space.children.length >= 100) {
    message_space.children[0].remove();
  }

}

function generate_message(message) {

  let message_html = create_Element('<div class="message center-item-row"></div>');
  let message_badges_html = create_Element('<div class="message-badges"></div>');
  let message_name_html = create_Element('<div class="message-name"></div>');
  let message_content_html = create_Element('<div class="message-content center-item-row"></div>');

  message_badges_html = generate_badges(message_badges_html, message.badges);
  message_name_html = generate_name(message_name_html, message);
  message_content_html = generate_content(message_content_html, message);

  message_html.appendChild(message_badges_html);
  message_html.appendChild(message_name_html);
  message_html.appendChild(message_content_html);

  return message_html;

}

function generate_name(object, message) {
  let name = document.createTextNode((message.display_name ? message.display_name : message.name) + ": ");
  object.appendChild(name);
  if (message.color) {
    object.style.color = message.color
  }
  return object
}

function generate_badges(object, badges) {
  for (badge of badges) {
    let path;
    let alt="badge";
    try {
      path = global_badges['badge_sets'][badge.name]['versions'][badge.version]['image_url_2x'];
    } catch (e) {
      console.log("could not generate badge: "+badge.name+badge.version);
      continue
    }
    let b = create_Element('<img badge src="'+path+'" alt="'+alt+'"></img>')
    object.appendChild(b);
  }
  return object;
}

function generate_content(object, message) {
  var message_parts = message.content.split(" ");
  if (message.emotes.length) {
    for (emote of message.emotes) {
      var link = "https://static-cdn.jtvnw.net/emoticons/v1/"+emote.id+"/2.0";
      var img_element = create_Element('<img emote src="'+link+'">');

      // replace imagestring in parts
      for (part in message_parts) {
        if (message_parts[part] == emote.name) {
          message_parts[part] = img_element;
        }
      }

    }
  }
  // construngt message content
  for (p of message_parts) {
    if (typeof p == "string") {
      let tp = create_Element("<span word></span>");
      tp.appendChild( document.createTextNode(p) );
      object.appendChild(tp);
    } else {
      object.appendChild(p.cloneNode(true));
    }
  }
  console.log(object)
  return object;
}

// utilitys

const create_Element = ( domstring ) => {
    const html = new DOMParser().parseFromString( domstring , 'text/html');
    return html.body.firstChild;
};

function api_call(address, success_function) {
  var request = new XMLHttpRequest();
  request.open('GET', address, true);
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      success_function(this.response);
    }
  }
  request.send();
}

function load_badges() {
  try {
    api_call("https://badges.twitch.tv/v1/badges/global/display", function (data) {
      global_badges = JSON.parse(data)
      load_channel_custom_badges();
    })
  }
  catch (e) {
    console.log("error loading badges");
  }
}

function load_channel_custom_badges() {
  try {
    api_call("https://badges.twitch.tv/v1/badges/channels/"+channel_id+"/display", function (data) {
      data = JSON.parse(data);

      for (var b_set in data["badge_sets"]) {
        for (var b_set_version in data["badge_sets"][b_set]['versions']) {
          global_badges["badge_sets"][b_set]['versions'][b_set_version] = data["badge_sets"][b_set]['versions'][b_set_version];
        }
      }

    })
  }
  catch (e) {
    console.log("error loading channel badges");
  }
}

// load finished
document.body.onload = function () {
  TC.Connect();
  TC2.Connect();
}