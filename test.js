var idRoom;   //Room name
var idUser;     //User id
var nameRoom;
var eliminado;
var source;
var message;
var CHAT_TIMEOUT = 60000; //10 seconds

function updateError1(datos){
  var html = " ";
      html +="<div class='alert alert-warning'><strong>";
      html +=datos;
      html +="</strong></div>";
  document.getElementById('encab').innerText = html;
};


    var chatUI = new ChatUI(document.getElementById('chat'));

  function updateRoomInfo(datos){
    console.log("LOS DATOS SON:"+datos);

    var idUser = JSON.parse(datos).USER_ID;
    var idRoom = JSON.parse(datos).ROOM_ID;

    if(source) {
      source.close()
    }
    if (idRoom >= 0) {
      source = new EventSource("../topn/"+idRoom+"/"+idUser);
    }
    else{
      window.location ="http://31.220.63.234:8000/index.html";
    }

    source.onmessage = function(event) {
    console.log("datosss  "+event.data);
      //entra en el if cada ver que no existan chats para la persona que castea
      if (event.data === '[]') {
        console.log("datosss  "+event.data);
              nameError= "Ha sido eliminado de la sala";
	      var chatsList= "<ul>";
	          chatsList+= "<div class='message my-message float-center'>";
	          chatsList+= nameError;
	          chatsList+="</div>";
	      }

        chatUI.clear()

        var messages = JSON.parse(event.data);
        var roomName = messages ? messages[0].room : '';

        console.log(messages);

        $.each(messages,function(index,message){
            chatUI.addMessage(message);
        });



        chatUI.setTitle(roomName);
        chatUI.show(CHAT_TIMEOUT);
    };//onMessage

  };//updateRoomInfo


cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.INFO);
cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.NONE);


//var datosApp=0;
var mediaElement = document.getElementById('vid');

// Create the media manager. This will handle all media messages by default.
window.mediaManager = new cast.receiver.MediaManager(mediaElement);

// Remember the default value for the Receiver onLoad, so this sample can Play
// non-adaptive media as well.
window.defaultOnLoad = mediaManager.onLoad.bind(mediaManager);

// Be careful that 'this' points to the mediaManager object and not the window object.
// For example, if you're not using streaming media, the following line:
// window.defaultOnLoad = mediaManager.onLoad;
// Can return an exception similar to the following:
// Uncaught TypeError: Cannot read property 'load' of undefined
//const options = new cast.framework.CastReceiverOptions();
//options.maxInactivity = 3600;

mediaManager.onLoad = function(event) {
// The Media Player Library requires that you call player unload between
// different invocations.
if (window.player !== null) {
console.log("Unload Player ");
player.unload(); // Must unload before starting again.
window.player = null;
}
// This trivial parser is by no means best practice, it shows how to access
// event data, and uses the a string search of the suffix, rather than looking
// at the MIME type which would be better.  In practice, you will know what
// content you are serving while writing your player.
if (event.data['media'] && event.data['media']['contentId']) {
  console.log('Starting media application');
  var url = event.data['media']['contentId'];
  // Create the Host - much of your interaction with the library uses the Host and
  // methods you provide to it.
  window.host = new cast.player.api.Host({
    'mediaElement': mediaElement,
    'url': url
  });
  var ext = url.substring(url.lastIndexOf('.'), url.length);
  var initStart = event.data['media']['currentTime'] || 0;
  var autoplay = event.data['autoplay'] || true;
  var protocol = null;
  mediaElement.autoplay = autoplay; // Make sure autoplay get's set
  if (url.lastIndexOf('.m3u8') >= 0) {
    // HTTP Live Streaming
    protocol = cast.player.api.CreateHlsStreamingProtocol(host);
  } else if (url.lastIndexOf('.mpd') >= 0) {
    // MPEG-DASH
    protocol = cast.player.api.CreateDashStreamingProtocol(host);
  } else if (url.indexOf('.ism/') >= 0) {
    // Smooth Streaming
    protocol = cast.player.api.CreateSmoothStreamingProtocol(host);
  }

  // How to override a method in Host. I know that it's safe to just provide this
  // method.
  host.onError = function(errorCode) {
    console.log("Fatal Error - " + errorCode);
    if (window.player) {
      window.player.unload();
      window.player = null;
    }
  };
  // If you need cookies, then set withCredentials = true also set any header
  // information you need.  If you don't need them, there can be some unexpected
  // effects by setting this value.
  //      host.updateSegmentRequestInfo = function(requestInfo) {
  //        requestInfo.withCredentials = true;
  //      };
  console.log("we have protocol " + ext);
  if (protocol !== null) {
    console.log("Starting Media Player Library");
    window.player = new cast.player.api.Player(host);
    window.player.load(protocol, initStart);
  } else {
    window.defaultOnLoad(event); // do the default process
  }
}
}

var userAgent = 0;
window.player = null;
console.log('Application is ready, starting system');
window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

// scrip para recibir datos de la app
// window.onload = function() {

console.log('Starting Receiver Manager');

// handler for the 'ready' event
castReceiverManager.onReady = function(event) {
  console.log('Received Ready event: ' + JSON.stringify(event.data));
  window.castReceiverManager.setApplicationState('Application status is ready...');
};

// handler for 'senderconnected' event

castReceiverManager.onSenderConnected = function(event) {
  if(userAgent == 0){console.log("Nuevo Sender");}else{
    console.log("No tiene permitido castear a otra usuario");
  //userAgent = 0;
  //window.close()
  }
  console.log('Received Sender Connected event: ' + event.data);
  userAgent  = window.castReceiverManager.getSender(event.data).userAgent;
  console.log("User Agent :" + userAgent);

};

// handler for 'senderdisconnected' event
castReceiverManager.onSenderDisconnected = function(event) {
  console.log("Sender Desconectado");
  if(window.castReceiverManager.getSenders().length == 0 &&
    event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
    window.close();
  }
};

// create a CastMessageBus to handle messages for a custom namespace
window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:ar.com.bondus');
//com.google.cast.sample.helloworld
// handler for the CastMessageBus message event
window.messageBus.onMessage = function(event) {
  console.log('Message [' + event.senderId + ']: ' + event.data);
  // display the message from the sender
  //función para tratamiento de error
  if (event.data == "[]") {
    event.data = "No se obtuvieron mensajes";
    updateError1(event.data);
    //location.href ="http://31.220.63.234:8000/client.html";
  }
  else if(event.data == -1){
    updateIndex(event.data);
    //location.href ="http://31.220.63.234:8000/index.html";
  }
  else {
    updateRoomInfo(event.data);
    //location.href ="http://31.220.63.234:8000/client.html";
  }
  // inform all senders on the CastMessageBus of the incoming message event
  // sender message listener will be invoked
  window.messageBus.send(event.senderId, event.data);

  window.castReceiverManager.setApplicationState(event.data);
}

//  };

castReceiverManager.start();
