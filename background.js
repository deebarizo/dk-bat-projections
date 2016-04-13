chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  	if(message.method == 'setTeams') {

  		teams = message.teams;
  	
  	} else if(message.method == 'getTeams') {

    	sendResponse(teams);
  	}
});

chrome.runtime.onConnect.addListener(function(port){

	port.onMessage.addListener(function(msg) {

	    if (msg.greeting == "hello") {
	    	
	    	var port = chrome.tabs.connect(0, {name: "mycontentscript"});

	    	port.postMessage({greeting:"hello"});

	    	console.log('hello');
	    }
	});
});