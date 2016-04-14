chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  	if(message.method == 'setTeams') {

  		teams = message.teams;

  		console.log('setTeams');
  	
  	} else if(message.method == 'getTeams') {

    	sendResponse(teams);

    	console.log('getTeams');
  	}
});

chrome.runtime.onConnect.addListener(function(port){

	port.onMessage.addListener(function(message) {

	    if (message.method == "sendTeam" && port.name == 'popupPort') {

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			
			    var activeTab = tabs[0];
			    
				var contentPort = chrome.tabs.connect(activeTab.id, {name: "contentPort"});

    			contentPort.postMessage({ method: "sendTeam", team: message.team });
			});
	    }
	});
});