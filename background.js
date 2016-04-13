var title;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  	if(message.method == 'setTeams') {

  		teams = message.teams;
  	
  	} else if(message.method == 'getTeams') {

    	sendResponse(teams);
  	}
});