chrome.runtime.sendMessage({ method: 'getTeams' }, function(response) {
  	
  	teams = response;

  	createTeamsTable(teams);

    createHittersTable(teams);
});

var port = chrome.runtime.connect({name: "popup-port"});

function createTeamsTable(teams) {

    for (var i = 0; i < teams.length; i++) {
        
        var tableRowHtml = '<tr><td><a class="team" href="#'+teams[i]['name']+'">'+teams[i]['name']+'</a></td><td>'+teams[i]['lineupIsSet']+'</td><td>'+teams[i]['stack']['avgSalary']+'</td><td>'+teams[i]['stack']['avgValue']+'</td></tr>';

        $('table#teams tbody').append(tableRowHtml);
    }

    var teamsTable = $('#teams').DataTable({
        
        "paging": false,
        "order": [[3, "desc"]]
    });
}	

function createHittersTable(teams) {

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

        var teamName = $(this).attr('href').replace('#', '');

        hittersTable.columns(0).search(teamName).draw();

        window.location.hash = '#hitters-header';

        port.postMessage({greeting:"hello"});
    });
}

