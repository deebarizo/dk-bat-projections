chrome.runtime.onConnect.addListener(function(port){

    port.onMessage.addListener(function(message) {

        if (message.method == "sendTeam" && port.name == 'contentPort') {

            $('tbody.projections-container tr').show();
            
            $('tbody.projections-container tr').each(function() {

                var teamOnBat = $(this).find('td.suggested[data-column="team"]').text().trim();

                if (teamOnBat !== message.team) {

                    $(this).hide();
                }
            });
        }
    });
});

// Chrome Storage API is asynchronous
// http://stackoverflow.com/questions/16336367/what-is-the-difference-between-synchronous-and-asynchronous-programming-in-node

chrome.storage.sync.get('costPerEntry', function(items) { 

    var teamNames = [];

    $('tbody.projections-container tr').each(function() {

        var teamName = $(this).find('td.suggested[data-column="team"]').text();

        teamNames.push(teamName);
    });

    teamNames = teamNames.filter(onlyUnique);

    var teams = [];

    for (var i = 0; i < teamNames.length; i++) {

        var team = new Team(teamNames[i]);

        if (team.hitters.length > 5) {

            teams.push(team);
        }
    }

    teams.sort(function(a, b) { // http://stackoverflow.com/a/979289

        return parseFloat(b.stack.avgValue) - parseFloat(a.stack.avgValue);
    });

    chrome.runtime.sendMessage({
     
        method: 'setTeams',
        teams: teams
    });
});


/****************************************************************************************
TEAM
****************************************************************************************/

function Team(name) {

    this.name = name;

    this.hitters = this.getHitters();

    this.stack = this.getStack();
}

Team.prototype.getHitters = function() {

    var hitters = [];

    var $this = this;
    
    $('tbody.projections-container tr').each(function() {

        var teamName = $(this).find('td.suggested[data-column="team"]').text();

        var position = $(this).find('td.voluntary').text();

        if (teamName === $this.name && position !== 'SP') {

            var playerName = $(this).find('td.pname').text();
            
            var fpts = parseFloat($(this).find('input.fpts').val());
            
            var value = parseFloat($(this).find('input.fpts').closest('td').next().text());
            
            var battingOrder = $(this).find('td.order').text();
            if (!isNaN(battingOrder)) {

                battingOrder = parseInt(battingOrder);
            }
            
            var salary = formatSalary($(this).find('td[data-column="salary"]').text());

            var player = new Player(playerName, fpts, value, battingOrder, position, salary);

            hitters.push(player);
        }
    });    

    var LineupIsSet = false;

    for (var i = 0; i < hitters.length; i++) {
        
        if (!isNaN(hitters[i]['battingOrder'])) {

            LineupIsSet = true;

            break;
        }
    }

    if (LineupIsSet) {

        for (var i = 0; i < hitters.length; i++) {
            
            if (isNaN(hitters[i]['battingOrder'])) {

                hitters.splice(i, 1);
            }            
        }        
    }

    this.lineupIsSet = LineupIsSet;

    hitters.sort(function(a, b) { // http://stackoverflow.com/a/979289

        if (b.value !== a.value){

            return parseFloat(b.value) - parseFloat(a.value);

        } else {
            
            return parseFloat(b.salary) - parseFloat(a.salary);
        }
    });

    return hitters;
};

Team.prototype.getStack = function() {

    return new Stack(this.hitters);
};


/****************************************************************************************
PLAYER
****************************************************************************************/

function Player(name, fpts, value, battingOrder, position, salary) {

    this.name = name;
    this.fpts = fpts;
    this.value = value;
    this.battingOrder = battingOrder;
    this.position = position;
    this.salary = salary;
}


/****************************************************************************************
STACK
****************************************************************************************/

function Stack(hitters) {

    this.hitters = hitters.slice(0, 5);

    this.totalSalary = this.getTotalSalary();

    this.avgSalary = this.getAvgSalary();

    this.avgValue = this.getAvgValue();
}

Stack.prototype.getTotalSalary = function() {

    var totalSalary = 0;

    for (var i = 0; i < this.hitters.length; i++) {
        
        totalSalary += this.hitters[i]['salary'];
    }

    return totalSalary;
};

Stack.prototype.getAvgSalary = function() {

    avgSalary = this.totalSalary / this.hitters.length;

    return parseInt(avgSalary); // two decimal places
}

Stack.prototype.getAvgValue = function() {

    var totalFpts = 0;

    for (var i = 0; i < this.hitters.length; i++) {
        
        totalFpts += this.hitters[i]['fpts'];
    }

    avgValue = totalFpts / (this.totalSalary / 1000);

    return parseFloat(Math.round(avgValue * 100) / 100).toFixed(2);; // http://stackoverflow.com/a/6134070
};


/****************************************************************************************
HELPERS
****************************************************************************************/

function onlyUnique(value, index, self) { // http://stackoverflow.com/a/14438954

    return self.indexOf(value) === index;
}

function formatSalary(salary) {

    salary = salary.replace('$', '');
    salary = salary.replace('K', '');

    return parseFloat(salary)*1000;
}
