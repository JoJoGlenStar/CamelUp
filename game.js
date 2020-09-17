/*
Camel Up
A digital reproduction of the boardgame Camel Up. Only for personal use and not to distributed in any way as im sure that would violate some copyright act.
By: Joe Glennon
*/

/* 
Notes:

//remove onclick code from html and use event listners instead. 
//will allow for if statments to moderate when clicking is avalible

*/

var Card = function (color, playerId, id){
    this.color = color;
    this.playerId = playerId;
    this.id = id;
}

var ModToken = function(name){
    this.value = 0;
    this.owner = name;
}

var Player = function(name, id){
    this.name = name;
    this.id = id;
    this.money = 3;
    this.bets = [];
    this.modTokenUsed = false;
    this.cards = [new Card('blue', id, 0),
                  new Card('green', id, 1),
                  new Card('orange', id, 2),
                  new Card('yellow', id, 3),
                  new Card('white', id, 4)];
    this.transportCard = null;
    this.transportModToken = null;
    //selecting a final win/lose bet
    this.selectCard = function(cardChoice){
        if(this.transportCard != null && this.transportCard == cardChoice){
            removeClass('selected');
            removeClass('highlight');
            this.transportCard = null;
        }
        else{
            //save selection
            this.transportCard = cardChoice;
            //remove any currently selected
            removeClass('selected');
            //adjust selected card position
            document.getElementById('cardback-'+cardChoice).classList.add('selected');
            document.getElementById('cardface-'+cardChoice).classList.add('selected');

            //highlight win and lose bet piles
            document.getElementById('final_winner_bets_box').classList.add('highlight');
            document.getElementById('final_loser_bets_box').classList.add('highlight');
            //might need something to prevent other actions from being taken once a card is selected
            //can only select final bet or switch cards or unselect card
        }
       
    }; 

    //place final win/lose bet
    this.playCard = function(card, pileChoice){
        if(this.transportCard != null){
            //remove card form user
            this.cards.splice(this.transportCard, 1);

            //remove highlights
            removeClass('highlight');

            //remove selected class
            removeClass('selected');

            if(pileChoice == 'win'){
                //add winner card bet
                endWinBets.push(card);
                //update win stack display
                document.getElementById('final_win_bet').src = 'images/cardback-'+this.id+'.JPG';
                document.getElementById('final_win_bet').style.display = 'block';
            }
            else{
                //add loser card bet
                endLoseBets.push(card);
                //update lose stack display
                document.getElementById('final_lose_bet').src = 'images/cardback-'+this.id+'.JPG';
                document.getElementById('final_lose_bet').style.display = 'block';
            }
        transportCard = null;
        nextPlayer();
        }
    };

    //select modToken to use
    this.selectModToken = function(value){
        if(this.transportModToken != null && this.transportModToken == value){
            //remove any currently selected
            removeClass('bad');
            removeClass('good');
            removeClass('selected');
            this.transportModToken = null;
        }
        else{
            this.transportModToken = value;
            //remove any currently selected
            removeClass('selected');
            //adjust selection
           if(value == 1){
               document.getElementById('oasis').classList.add('selected');
           }
           else{
               document.getElementById('mirage').classList.add('selected');
           }
   
           //highlight avalible locations
           document.getElementById('0').classList.add('bad')
           for(var i=1; i<raceTrack.length-1; i++){
               //if space has modToken
               if(checkMod(i)){
                   //highlight space and two adjcent red
                   document.getElementById(i-1).classList.add('bad');
                   document.getElementById(i-1).classList.remove('good');
                   document.getElementById(i).classList.add('bad');
                   document.getElementById(i+1).classList.add('bad');
                   //skip next space
                   i++;
               }
               else{
                   document.getElementById(i).classList.add('good');
               }
           }
        }
        
    };

    //play modToken
    this.useModToken = function(location){
        if(this.transportModToken != null && !checkMod(location-1) && !checkMod(location) && !checkMod(location+1)){
            //remove token from user
            this.modTokenUsed = true;

            //remove highlights
            removeClass('good');
            removeClass('bad');

            //remove selected class
            removeClass('selected');

            //add token to track
            raceTrack[location].modToken.value = this.transportModToken;
            raceTrack[location].modToken.owner = name;
           
            //display token
            if(this.transportModToken === 1){
                changeImgSrc('mod_'+location, 'oasis', currentPlayer);
            }
            else{
                changeImgSrc('mod_'+location, 'mirage', currentPlayer);
            }

            //update display
            nextPlayer();
        }
    };

     //gain money
     this.gainMoney = function(amount){
         this.money = this.money + amount; 
    };

    //lose money
    this.loseMoney = function(amount){
        this.money = this.money - amount; 
    };

    //roll dice and move camel
    this.usePyrmaid = function(){
        //give player 1 moneys
        this.gainMoney(1);
        //roll the dice
        var temp = rollDice();
        //display dice results
        document.getElementById(temp.color + '_dice').src='images/'+temp.color+'-'+temp.num +'.jpg';
        document.getElementById(temp.color + '_dice').style.display = 'block';
        //update pyrmaid tiles
        changeImgSrc('pyrmaid_tiles', 'pyrmaidTile');

        //locate camel & move camel
        var location = locateCamel(temp.color);
        var newLocation = location+temp.num;
        //check for end of game
        if(newLocation > gameLength-2){//game over
            moveCamel(location, temp);
            gameOver = true;
            updateCamelDisplay();
            camelPosConsole();
        }
        else{
            moveCamel(location, temp);
            //check for mod token
            if(checkMod(newLocation)){
                applyMod(newLocation, temp.color);
            }
            updateCamelDisplay();
            //testing--disply camel position
            camelPosConsole();
            nextPlayer();
        }
       
    };

    //take leg bet
    this.takeBet = function(colorIndex){
        this.bets.push(legBettingTiles[colorIndex].pop());
        
        //update leg Bets display
        if(colorIndex === 0){
            changeImgSrc('blue_leg', 'blueLeg');
        }            
        else if(colorIndex === 1){
            changeImgSrc('green_leg', 'greenLeg');
        }
        else if(colorIndex === 2){
            changeImgSrc('orange_leg','orangeLeg');
        }
        else if(colorIndex === 3){
            changeImgSrc('yellow_leg', 'yellowLeg');
        }
        else{
            changeImgSrc('white_leg','whiteLeg');
        }

        nextPlayer();
    };

    //calculate leg bets
    this.calcBet = function(first, second){
        //pop bet
        var tempBet = this.bets.pop()
        if(tempBet.color === first){
            this.gainMoney(tempBet.value);
        }
        else if(tempBet.color === second){
            this.gainMoney(1);
        }
        else{
            this.loseMoney(1);
        }
    };
  
}

var Camel = function(color){
    this.color = color;
}

var Boardspace = function(){
    this.camelStack = [];
    this.modToken = new ModToken('');
}

var Dice = function(color){
    this.color = color;
    this.num = Math.floor(Math.random()*3)+1;
}

var LegBet = function(value, color){
    this.value = value;
    this.color = color;
}

var numPlayers, gameLength, players = [], gameOver=false, legEnd;
var pyrmaid = [], endWinBets = [], endLoseBets = [], legBettingTiles = [];
var raceTrack = [], currentPlayer;

//testing functions
function camelPosConsole(){
    for(var i =0; i< raceTrack.length; i++){
        if(raceTrack[i].camelStack.length > 0){
            console.log(i+1);
            for(thing of raceTrack[i].camelStack){
                console.log(thing.color);
            }
        }
    }
    console.log('');
}

//END Testing Function


//sleep function
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

//get number of players from user
function getPlayers(){
    numPlayers = document.getElementById('num_players').value;
    for(var i=0; i < numPlayers; i++){
        document.querySelector('#play_'+i).style.display = 'block';
        document.querySelector('#icon-'+i).style.display = 'block';
    }
    
    for(var i=numPlayers; i < 8; i++){
        document.querySelector('#play_'+i).style.display = 'none';
        document.querySelector('#icon-'+i).style.display = 'none';
    }
}

//takes element id and updates img src
function changeImgSrc(elId, baseName, sid){
    if(sid === undefined){
        var srcString, id;
        srcString = document.getElementById(elId).src;
        srcString = srcString.split('-');
        srcString = srcString[1].split('.');
        id = parseInt(srcString[0]);
        if(id > 0){
            document.getElementById(elId).src = 'images/'+baseName+'-'+(id-1)+'.JPG';
        }
        else{
            document.getElementById(elId).style.display = 'none';
        }
    }
   else{
    document.getElementById(elId).src = 'images/' + baseName + '-' + sid + '.JPG';
    document.getElementById(elId).style.display = 'block';
   }
}

//removes a class from all elements
function removeClass(className){
    var el = document.querySelectorAll('.'+className);
    for(item of el){
        item.classList.remove(className);
    }
}

//returns a random Dice from the pyrmaid or -1 if empty
function rollDice(){
    if(pyrmaid.length > 0){
        var tempDice = pyrmaid.splice(Math.floor(Math.random()*pyrmaid.length),1);
        if(pyrmaid.length <= 0){
            //trigger end of leg
            legEnd = true;
        }
        return tempDice[0];
    }
    else{
        return -1;
    }  
}

function fillPyrmaid(){
    pyrmaid = [new Dice('orange'), new Dice('blue'), new Dice('green'), new Dice('yellow'), new Dice('white')];
    legEnd =false;
    document.getElementById('blue_dice').style.display ='none';
    document.getElementById('green_dice').style.display ='none';
    document.getElementById('orange_dice').style.display ='none';
    document.getElementById('yellow_dice').style.display ='none';
    document.getElementById('white_dice').style.display ='none';
}

function initLegBets(){
    var orangeBets = [new LegBet(2,'orange'), new LegBet(3,'orange'), new LegBet(5,'orange')];
    var blueBets = [new LegBet(2,'blue'), new LegBet(3,'blue'), new LegBet(5,'blue')];
    var greenBets = [new LegBet(2,'green'), new LegBet(3,'green'), new LegBet(5,'green')];
    var yellowBets = [new LegBet(2,'yellow'), new LegBet(3,'yellow'), new LegBet(5,'yellow')];
    var whiteBets = [new LegBet(2,'white'), new LegBet(3,'white'), new LegBet(5,'white')];
    legBettingTiles = [blueBets, greenBets, orangeBets, yellowBets, whiteBets];

    //display leg bets
    document.getElementById('blue_leg').src = 'images/blueLeg-2.JPG';
    document.getElementById('blue_leg').style.display = 'block';
    document.getElementById('green_leg').src = 'images/greenLeg-2.JPG';
    document.getElementById('green_leg').style.display = 'block';
    document.getElementById('orange_leg').src = 'images/orangeLeg-2.JPG';
    document.getElementById('orange_leg').style.display = 'block';
    document.getElementById('yellow_leg').src = 'images/yellowLeg-2.JPG';
    document.getElementById('yellow_leg').style.display = 'block';
    document.getElementById('white_leg').src = 'images/whiteLeg-2.JPG';
    document.getElementById('white_leg').style.display = 'block';
}

//locate camel--returns boardspace index
function locateCamel(color){
    var camelFound = false;
    var n=0, length=0;
    while(!camelFound){
        length = raceTrack[n].camelStack.length;
        if(length > 0){
            for(var i=0; i<length; i++){
                if(raceTrack[n].camelStack[i].color === color){
                    camelFound = true;
                }  
            }
        }
        n++;
    }
    return n - 1;
}

//takes in a dice object and moves the accociated camel or camel stack
function moveCamel(camelLocation, diceIn){
    var tempCamelStack = [];
    var tempCamel, newSpot;
    do{
        tempCamel =raceTrack[camelLocation].camelStack.pop();
        tempCamelStack.unshift(tempCamel);
    }while(tempCamel.color != diceIn.color);
    newSpot = camelLocation+diceIn.num;
    if(newSpot > 15){
         raceTrack[16].camelStack = tempCamelStack;
    }
    else{
        raceTrack[newSpot].camelStack = raceTrack[newSpot].camelStack.concat(tempCamelStack);
    }
}

//check for mod token at specific location
function checkMod(location){
    if(raceTrack[location].modToken.value == 0){
    return false;
    }
    else{
    return true;
    }
}

//apply mod token effects
function applyMod(location, color){
    //give approperiate player money
    for(var i=0; i<players.length; i++)
    {
        if(players[i].name === raceTrack[location].modToken.owner){
            players[i].gainMoney(1);
        }
    }
    //move camels
    var tempCamelStack = [];
    var tempCamel;
    var modValue = raceTrack[location].modToken.value;
    do{
        tempCamel = raceTrack[location].camelStack.pop();
        tempCamelStack.unshift(tempCamel);
     }while(tempCamel.color != color);

        //add camels to top of stack
        if(modValue === 1){
            if(location+modValue > gameLength-2){
                gameOver = true;
            }
            raceTrack[location + modValue].camelStack = raceTrack[location + modValue].camelStack.concat(tempCamelStack);
        }
        //add camels to bottem of stack
        else{
            raceTrack[location + modValue].camelStack = tempCamelStack.concat(raceTrack[location + modValue].camelStack);
        }
}

//reset status of all mod tokens
function resetMod(){
    for(var i=0; i<raceTrack.length; i++){
        if(raceTrack[i].modToken.value != 0){
            raceTrack[i].modToken.value = 0;
            raceTrack[i].modToken.owner = '';
            document.getElementById('mod_'+i).style.display = 'none';
        }
    }
    for(var i=0; i<players.length; i++){
        players[i].modTokenUsed = false;
    }
}

//return 2 leading camels
function getLeads(){
    var first, second, firstFound = false, leads=[];

    for(var i=raceTrack.length-1; i>0; i--){
        if(firstFound && raceTrack[i].camelStack.length > 0){
            second = raceTrack[i].camelStack.pop();
            raceTrack[i].camelStack.push(second);
            i=0;
        }
        else if(raceTrack[i].camelStack.length > 0){
            first = raceTrack[i].camelStack.pop();
            firstFound = true;
            if(raceTrack[i].camelStack.length > 0 && firstFound){
                second = raceTrack[i].camelStack.pop();
                raceTrack[i].camelStack.push(second);
                raceTrack[i].camelStack.push(first);
                i=0;
            }
            else{
                raceTrack[i].camelStack.push(first);
            }   
        }
    }
    leads = [first.color, second.color];
    return leads
}

//return last place camel
function getTail(){
    for(var i=0; i<raceTrack.length; i++){
        if(raceTrack[i].camelStack.length > 0){
            var tail = raceTrack[i].camelStack.shift();
            i=raceTrack.length;
        }
    }
    return tail.color;
}

function calcLegBets(){
    //calculate end of leg points
    var leads = getLeads();
    for(var i=0; i<players.length; i++){ //loops through players
        if(players[i].bets.length > 0){//check if player has bets
            var numBets = players[i].bets.length;
            for(var n=0; n<numBets; n++){ //calls calcBet for every bet taken
                players[i].calcBet(leads[0], leads[1]);
            }   
        }
    }
}

//change player
function nextPlayer(){
    //remove prev player display
    document.querySelector('.display_player').classList.remove('cur_player_' + currentPlayer);
    document.getElementById('cur_player_info').classList.remove('cur_player_' + currentPlayer);
    //update current player index
    if(currentPlayer + 1 < numPlayers){
        currentPlayer++;
    }
    else{
        currentPlayer = 0;
    }
    //update display
    updateUserDisplay();
}

//update user display
function updateUserDisplay(){
    document.getElementById('icon_big_0').src = 'images/icon-'+currentPlayer+'.png';
    document.getElementById('display_player_name').innerHTML= players[currentPlayer].name;
    document.getElementById('display_player_money').innerHTML = '$'+players[currentPlayer].money;
    document.querySelector('.display_player').classList.add('cur_player_' + currentPlayer);
    document.getElementById('cur_player_info').classList.add('cur_player_' + currentPlayer);
    //remove cards from view
    var cardsTemp = document.querySelectorAll('.hand');
    for(item of cardsTemp){
        item.style.display ='none';
    }
    //display new user cards
    var i =0;
    for(card of players[currentPlayer].cards){
        changeImgSrc('cardback-'+i, 'cardback', currentPlayer);
        changeImgSrc('cardface-'+i, 'final-'+card.id, currentPlayer)
        i++;        
    }
    //display user mod tokens if not used
    if(!players[currentPlayer].modTokenUsed){
        changeImgSrc('mirage','mirage',currentPlayer);
        changeImgSrc('oasis','oasis',currentPlayer);
    }
    else{
        document.getElementById('mirage').style.display = 'none';
        document.getElementById('oasis').style.display = 'none';
    }

    //remove prev users taken bets
    var betsTemp = document.querySelectorAll('.taken_bet');
    for(bet of betsTemp){
        bet.style.display ='none';
    }
    //display users taken bets
    for(bet of players[currentPlayer].bets){
        document.getElementById(bet.color+'_'+bet.value).style.display = 'inline';
    }
    
}

//update camels display
function updateCamelDisplay(){
    //loop through racetrack
    for(var i=0; i<gameLength; i++){
        if(raceTrack[i].camelStack.length > 0){//if camels on space, display them
            var j=0;
            for(item of raceTrack[i].camelStack){
                    // i = location  j = stackIndex
                    //display new camels
                    document.getElementById('camel_'+i+'_'+j).src='images/camel_'+item.color+'.PNG';
                    document.getElementById('camel_'+i+'_'+j).style.display = 'block';
                    j++;
            }
            //erase leftovers on camelStack
            for(j; j< 5; j++){
                document.getElementById('camel_'+i+'_'+j).style.display = 'none';
            }
        }
        else{//erase old camels 
           var eraseImgs = document.querySelectorAll('.space_'+i);
           for(img of eraseImgs){
               img.style.display = 'none';
           }
        }
    }
}

//initalize game
function initGame(){
    //initalize players
    for(var i=0; i<numPlayers; i++){
        players[i] = new Player (document.getElementById('play_'+i).value, i);
    }
    gameLength = 17;
    gameOver = false;
    legEnd = false;
    currentPlayer=0;

    //build gameboard
    for(var i=0; i<gameLength; i++)
    {
        raceTrack[i] = new Boardspace();
    }

    //initalize camels
    fillPyrmaid();

    //initalize camels starting positions
    for(var i=0; i<5; i++)
    {
        //roll dice
        var tempDice = rollDice();
        //Create and place camel
        var tempCamel = new Camel(tempDice.color);
        raceTrack[tempDice.num - 1].camelStack.push(tempCamel);
    }

     //initalize dice
     fillPyrmaid();

     //initalize leg bets
     initLegBets();

      //initalize display
      document.querySelector('#background_box').style.display = 'none';
      document.querySelector('#game_box').style.display = 'block';
      document.getElementById('cur_player_info').style.display = 'block';
      document.getElementById('icon_big_0').style.display = 'block';
    
      //initalize 1st user display
      updateUserDisplay();

      updateCamelDisplay();

      camelPosConsole();
}

//when leg ends
function nextLeg(){

    sleep(500);

    //calc money gain/loss
    calcLegBets();

    //display end of leg summery
    document.getElementById('leg_summery_container').style.display = 'block';
    document.getElementById('icon_big_0').src = 'images/icon-0.png';
    for(var i=0; i< numPlayers; i++){
        document.getElementById('icon_big_'+i).style.display = 'block';
        document.getElementById('player_'+i+'_sum').style.display = 'block';
        document.getElementById('player_'+i+'_name').innerHTML = players[i].name;
        document.getElementById('player_'+i+'_money').innerHTML = '$'+players[i].money;
        document.getElementById('player_'+i+'_cards').innerHTML = 'Cards Left: '+players[i].cards.length;
    }
    
    //reset leg betting tiles
    initLegBets();
    //reset pyrmaid
    fillPyrmaid();
    //resetting all mod tokens
    resetMod()
    //reset pyrmaid tiles
    changeImgSrc('pyrmaid_tiles', 'pyrmaidTile', 4);
    //display continue button
    document.getElementById('continue_leg').style.display = 'block';
}

function continueLeg(){
    //remove round summery
    document.getElementById('leg_summery_container').style.display = 'none';
    for(var i=0; i< numPlayers; i++){
        document.getElementById('player_'+i+'_sum').style.display = 'none';
        document.getElementById('icon_big_'+i).style.display = 'none';
    }
    document.getElementById('icon_big_0').style.display = 'block';
    document.getElementById('icon_big_0').src = 'images/icon-'+currentPlayer+'.png';
    document.getElementById('continue_leg').style.display = 'none';

}

//ends the game
function endGame(){
    //calculate leg bets
    calcLegBets();

    var leads = getLeads();
    var tail = getTail();
    var x=0;
    //calc end of game bets
    //Final loser bets
    for(var i=0; i< endLoseBets.length; i++){
        if(endLoseBets[i].color == tail){
            if(x==0){
                players[endLoseBets[i].playerId].gainMoney(8);
            }
            else if(x ==1){
                players[endLoseBets[i].playerId].gainMoney(5);
            }
            else if(x ==2){
                players[endLoseBets[i].playerId].gainMoney(3);
            }
            else if(x ==3){
                players[endLoseBets[i].playerId].gainMoney(2);
            }
            else{
                players[endLoseBets[i].playerId].gainMoney(1);
            }
        }
        else{
            players[endLoseBets[i].playerId].loseMoney(1);
        }
    }
    //Final winner bets
    for(var i=0; i< endWinBets.length; i++){
        if(endWinBets[i].color == leads[0]){
            if(x==0){
                players[endWinBets[i].playerId].gainMoney(8);
            }
            else if(x ==1){
                players[endWinBets[i].playerId].gainMoney(5);
            }
            else if(x ==2){
                players[endWinBets[i].playerId].gainMoney(3);
            }
            else if(x ==3){
                players[endWinBets[i].playerId].gainMoney(2);
            }
            else{
                players[endWinBets[i].playerId].gainMoney(1);
            }
        }
        else{
            players[endWinBets[i].playerId].loseMoney(1);
        }
    }
    //determin winner
    var best=0, winner;
    for(var i=0; i<numPlayers; i++){
        if(players[i].money > best){
            best = players[i].money;
            winner = i;
        }
    }

    //display results with winner highlighted
    document.getElementById('leg_summery_container').style.display = 'block';
    for(var i=0; i< numPlayers; i++){5
        document.getElementById('player_'+(i)+'_sum').style.display = 'block';
        document.getElementById('player_'+(i)+'_name').innerHTML = players[i].name;
        document.getElementById('player_'+(i)+'_money').innerHTML = '$'+players[i].money;
        document.getElementById('player_'+(i)+'_cards').innerHTML = 'Cards Left: '+players[i].cards.length;
        //add winner css
        if(i == winner){
            document.getElementById('player_'+(i)+'_sum').classList.add('winner');
        }
    }
    


    //prevents infinate loop on endGame function
    gameOver = false;
}

//interval listner for end of leg
setInterval(function(){
    if(legEnd){
        nextLeg();
    }
},500);

//interval listner for end of game
setInterval(function(){
    if(gameOver){
        endGame();
    }
},1000);



