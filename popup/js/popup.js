// When you click the popup icon, the following messages get sent to background.js.

var popupPort = chrome.runtime.connect({ name: "popupPort" });

popupPort.postMessage({ method: "showAllPlayers" });

popupPort.postMessage({ method: 'getTeams' });


// This receives messages from background.js.

chrome.runtime.onConnect.addListener(function(port){

    port.onMessage.addListener(function(message) {

        if (message.method == "sendTeams" && port.name == 'popupPort') {

            createTables(message.teams);

            // The following messages get sent to DK Ownerships Chrome Extension.

            var dkOwnershipsExtensionId = 'dbmcmllglakammflgakbmdiffaiakfik';

            var dkOwnershipsPort = chrome.runtime.connect(dkOwnershipsExtensionId);

            dkOwnershipsPort.postMessage({ players: message.players });

            $('a.show-all-players').on('click', function(e) {

                e.preventDefault();

                popupPort.postMessage({ method: "showAllPlayers" });

                window.close();
            });
        }
    });
});


function createTables(teams) {

    // https://developer.chrome.com/extensions/storage#type-StorageArea
    // Chrome storage is asynchronous

    chrome.storage.sync.get({ teamColumnIndex: 2 }, function(items) { 

        for (var i = 0; i < teams.length; i++) {
            
            var tableRowHtml = '<tr><td><a class="team" href="#'+teams[i]['name']+'">'+teams[i]['name']+'</a></td><td>'+teams[i]['lineupIsSet']+'</td><td>'+teams[i]['stack']['avgSalary']+'</td><td>'+teams[i]['stack']['avgValue']+'</td></tr>';

            $('table#teams tbody').append(tableRowHtml);
        }

        var teamsTable = $('#teams').DataTable({
            
            "paging": false,
            "order": [[items.teamColumnIndex, "desc"]],
            "aoColumns": [
                null,
                null,
                { "orderSequence": ["desc", "asc"] },
                { "orderSequence": ["desc", "asc"] }
            ]
        });

        $('table#teams th:eq(2)').on('click', function() {

            chrome.storage.sync.set({ teamColumnIndex: 2 }, function() {} );
        });

        $('table#teams th:eq(3)').on('click', function() {

            chrome.storage.sync.set({ teamColumnIndex: 3 }, function() {} );
        });

        for (var i = 0; i < teams.length; i++) {

            for (var n = 0; n < teams[i]['hitters'].length; n++) {

                var tableRowHtml = '<tr><td>'+teams[i]['name']+'</td><td>'+teams[i]['hitters'][n]['name']+'</td><td>'+teams[i]['hitters'][n]['position']+'</td><td>'+teams[i]['hitters'][n]['battingOrder']+'</td><td>'+teams[i]['hitters'][n]['salary']+'</td><td>'+teams[i]['hitters'][n]['value']+'</td></tr>';
                
                $('table#hitters tbody').append(tableRowHtml);
            }
        }

        var hittersTable = $('#hitters').DataTable({
            
            "paging": false,
            "order": []
        });

        $('a.team').on('click', function() {

            console.log('bob');

            var teamName = $(this).attr('href').replace('#', '');

            hittersTable.columns(0).search(teamName).draw();

            window.location.hash = '#hitters-header';

            popupPort.postMessage({ method: "sendTeam", team: teamName});
        });
    });
}	
