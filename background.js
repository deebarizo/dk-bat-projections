chrome.runtime.onConnect.addListener(function(port){

	port.onMessage.addListener(function(message) {

	    if (message.method == 'getTeams' && port.name == 'popupPort') {

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			
			    var activeTab = tabs[0];
			    
				var contentPort = chrome.tabs.connect(activeTab.id, {name: 'contentPort'});

    			contentPort.postMessage({ method: 'getTeams' });
			});
	    }

	    if (message.method == 'sendTeams' && port.name == 'contentPort') {

	    	console.log(message.teams);

	    	var popupPort = chrome.runtime.connect({ name: "popupPort" });

	    	popupPort.postMessage({ method: 'sendTeams', teams: message.teams });
	    }

	    if (message.method == 'sendTeam' && port.name == 'popupPort') {

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			
			    var activeTab = tabs[0];
			    
				var contentPort = chrome.tabs.connect(activeTab.id, {name: 'contentPort'});

    			contentPort.postMessage({ method: 'sendTeam', team: message.team });
			});
	    }

	    if (message.method == 'showAllPlayers' && port.name == 'popupPort') {

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			
			    var activeTab = tabs[0];
			    
				var contentPort = chrome.tabs.connect(activeTab.id, {name: 'contentPort'});

    			contentPort.postMessage({ method: 'showAllPlayers' });
			});
	    }
	});
});