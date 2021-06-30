var configUrl = 'http://localhost:8040/';
var sock = io.connect(configUrl);

const log = (text) => {
    const parent = document.querySelector('#events');
    const el = document.createElement('li');
    el.innerHTML = text;

    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

const onChatSubmitted = (sock) => (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const name = document.getElementById('playerName').value;

    const text = name + ': ' + input.value;
    input.value = '';

    if (text != '') {
        sock.emit('message', text);
    }
};

(() => {
    sock.on('message', log);
    document
        .querySelector('#chat-form')
        .addEventListener('submit', onChatSubmitted(sock));
})();

const maxPeople = 4;

let drawCounter = 0;

function init() {
    var name = document.getElementById('playerName').value;

    if (name != '') {
        sock.emit('requestRoom', name);
        sock.emit('playerJoin', name);

        document.getElementById("playerName").disabled = true;
        document.getElementById("playerButton").disabled = true;

        document.getElementById("chat").disabled = false;
        document.getElementById("say").disabled = false;
    }
}


sock.on('startGame', (room) => {
    document.getElementById('chatBox').classList.add("chatCurrentGame");
    var currentName = document.getElementById('playerName').value;
    var currentID;
    for (let i = 0; i < 4; i++) {
        if (room['players'][i].name == currentName) {
            currentID = room['players'][i].id;
        }
    }
    var cardArray = createCardElements(room['deck']);
    showCards(cardArray, room.turn, room.direction, currentID, currentName);
    assignPlayerCards(cardArray, currentID);
    checkFirstCard(cardArray);
    currentCard(room.direction, room.turn);

    if (room.turn == currentID) {
        turn(room.turn, true, 0);

    } else {
        turn(room.turn, false, 0);
    }

    sock.on('drawCard', (playerTurn) => {
        if (playerTurn == currentID) {
            draw(playerTurn, true);

        } else {
            draw(playerTurn, false);
        }
    })

    sock.on('playCard', (data, playerTurn, direction, color, drawCounter) => {
        var newData = drop(data, playerTurn, direction, currentID, color, drawCounter);
        if (newData[1] == currentID) {
            turn(newData[1], true, newData[2]);

        } else {
            turn(newData[1], false, newData[2]);
        }
        console.log(newData);
        var div1 = document.getElementById('ondeck');
        div1.setAttribute('onclick', 'drawCard(' + newData[1] + ',' + currentID + ',"' + currentName + '")');
        var div1 = document.getElementById('onpile');
        div1.setAttribute('ondrop', 'dropServer(event, ' + newData[1] + ',' + newData[0] + ',' + newData[2] + ')');
        currentCard(newData[0], newData[1]);
    })

});

sock.on('forceDisconnect', (player) => {
    window.location.replace("../Frontend/");
});

sock.on("wait", (asdf) => {
    alert(asdf);
});


function createCardElements(deck) {
    let cardArray = [];
    for (let dataID = 0; dataID < deck.length; dataID++) {
        let cardDiv = document.createElement("div");
        cardDiv.setAttribute('id', 'card' + deck[dataID]['id']);
        cardDiv.setAttribute('class', 'card');
        cardDiv.setAttribute("data-id", deck[dataID]['id']);
        cardDiv.setAttribute("data-color", deck[dataID]['color']);
        cardDiv.setAttribute("data-type", deck[dataID]['type']);

        document.getElementById("gameboard").append(cardDiv);

        insertHiddenCard(deck[dataID]['id']);
        insertImages(deck[dataID]['id'], deck[dataID]['src']);
        cardArray[dataID] = cardDiv;
    }
    return cardArray;
}

function insertHiddenCard(dataID) {
    var node = document.createElement("div");
    node.setAttribute('class', 'covered');

    document.getElementById('card' + dataID).append(node);
}

function insertImages(dataID, src) {
    var node = document.createElement("div");
    node.setAttribute('class', 'shown');

    var imgNode = document.createElement("img");
    imgNode.setAttribute('id', 'card' + dataID);
    imgNode.setAttribute("src", src);
    imgNode.setAttribute('alt', 'Card ' + dataID);
    imgNode.setAttribute('width', '80');
    imgNode.setAttribute('height', '120');

    document.getElementById('card' + dataID).append(node);
    node.append(imgNode);
}

function showCards(array, turn, direction, currentID, currentName) {
    let deck = document.getElementById("gameboard");
    deck.innerHTML = "";

    let node = document.createElement('div');
    node.setAttribute('id', 'ondeck');
    node.setAttribute('onclick', 'drawCard(' + turn + ',' + currentID + ',"' + currentName + '")');
    document.getElementById("gameboard").appendChild(node);

    let node2 = document.createElement('div');
    node2.setAttribute('id', 'onpile');
    node2.setAttribute('ondrop', 'dropServer(event, ' + turn + ',' + direction + ',' + 0 + ')');
    node2.setAttribute('ondragover', 'allowDrop(event)');
    document.getElementById("gameboard").appendChild(node2);

    let node3 = document.createElement('div');
    node3.setAttribute('id', 'current');
    document.getElementById("gameboard").appendChild(node3);

    for (let i = array.length - 1; i >= 0; i--) {
        node.append(array[i]);
        if (i === 0) {
            array[i].classList.add('selected');
            document.getElementById("onpile").append(array[i]);
        }
    }
}

function assignPlayerCards(cardArray, currentPlayer) {
    let player = 0;
    for (let handCards = 1; handCards < (maxPeople * 7) + 1; handCards++) {
        if (handCards % 7 == 1) {
            player++;
            let node = document.createElement('div');
            let playerIndicator = document.createElement('div');

            node.setAttribute('id', 'player' + player);
            playerIndicator.setAttribute('id', 'playerIndicator' + player);
            playerIndicator.setAttribute('class', 'playerIndicator');

            document.getElementById("gameboard").appendChild(node);
            document.getElementById('player' + player).appendChild(playerIndicator);
        }
        if (currentPlayer === player) {
            cardArray[handCards].classList.add('selected');
        }
        document.getElementById("player" + player).appendChild(cardArray[handCards]);
    }
}

function checkFirstCard(cardArray) {
    if (cardArray[0]['dataset']['type'] !== 'Skip' &&
        cardArray[0]['dataset']['type'] !== 'Reverse' &&
        cardArray[0]['dataset']['type'] !== 'Draw2' &&
        cardArray[0]['dataset']['type'] !== 'Wild' &&
        cardArray[0]['dataset']['type'] !== 'Draw4') {
        return;
    } else {
        while (cardArray[0]['dataset']['type'] == 'Skip' || cardArray[0]['dataset']['type'] == 'Reverse' ||
            cardArray[0]['dataset']['type'] == 'Draw2' || cardArray[0]['dataset']['type'] == 'Wild' ||
            cardArray[0]['dataset']['type'] == 'Draw4') {
            console.log("New Card");
            let deck = document.getElementById("ondeck").children;
            deck[deck.length - 1].classList.add('selected');
            document.getElementById("onpile").append(deck[deck.length - 1]);
            let newCurrentCard = document.getElementById("onpile").children;

            if (newCurrentCard[newCurrentCard.length - 1]['dataset']['type'] != 'Skip' &&
                newCurrentCard[newCurrentCard.length - 1]['dataset']['type'] != 'Reverse' &&
                newCurrentCard[newCurrentCard.length - 1]['dataset']['type'] != 'Draw2' &&
                newCurrentCard[newCurrentCard.length - 1]['dataset']['type'] != 'Wild' &&
                newCurrentCard[newCurrentCard.length - 1]['dataset']['type'] != 'Draw4') {
                break;
            }
        }
    }
}

function currentCard(clockWise, playerTurn) {
    let cards = document.getElementById('onpile').children;
    let current = document.getElementById("current");
    current.textContent = "";
    document.getElementById('onpile').className = "";

    let node = document.createElement('p');
    current.appendChild(node);
    node.append("Color: " + cards[cards.length - 1]['dataset']['color']);

    let node2 = document.createElement('p');
    current.appendChild(node2);

    if (clockWise === true) {
        node2.append("Direction: Clockwise");
        document.getElementById('onpile').classList.add('directionIndicator');
    } else {
        node2.append("Direction: Counter-Clockwise");
        document.getElementById('onpile').classList.add('reverseDirectionIndicator');
    }

    let node3 = document.createElement('p');
    current.appendChild(node3);
    node3.append("Current Turn: Player " + playerTurn);
}

function drawCard(turn, currentID, currentName) {
    var name = document.getElementById('playerName').value;
    if (currentName == name && turn == currentID) {
        sock.emit('drawCard', turn);
    }

}

function draw(playerTurn, bool) {
    let deck = document.getElementById("ondeck").children;
    let handCards = document.getElementById('player' + playerTurn);
    let current = document.getElementById('onpile').children;

    if (deck.length > 0) {
        if (bool) {
            deck[deck.length - 1].classList.add('selected');
        }
        if (deck[deck.length - 1]['dataset']['color'] === current[current.length - 1]['dataset']['color'] ||
            deck[deck.length - 1]['dataset']['type'] === current[current.length - 1]['dataset']['type'] ||
            deck[deck.length - 1]['dataset']['color'] === 'Black' ||
            deck[deck.length - 1]['dataset']['type'] === 'Wild' ||
            deck[deck.length - 1]['dataset']['type'] === 'Draw4') {
            deck[deck.length - 1].setAttribute('ondragstart', "drag(event)");
            deck[deck.length - 1].classList.add('drop');
        }
        handCards.append(deck[deck.length - 1]);
    }

    isDeckEmpty();

}

function isDeckEmpty() {
    let deck = document.getElementById("ondeck").children;
    if (deck.length === 0) {
        let cards = document.getElementsByClassName('pile');
        let cardArray = [];

        for (let i = 0; i < cards.length; i++) {
            cardArray.push(cards[i]);
        }

        cardArray = shuffleCards(cardArray);

        for (let i = cardArray.length - 1; i >= 0; i--) {
            cardArray[i].classList.remove('pile');
            cardArray[i].classList.remove('selected');
            document.getElementById("ondeck").append(cardArray[i]);
        }
        console.log('New Deck');
    }
}

function shuffleCards(array) {
    let counter = array.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;

        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropServer(ev, playerTurn, direction, drawCounter) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    let current = document.getElementById(data);

    if (current['dataset']['type'] == "Wild" || current['dataset']['type'] == "Draw4") {
        let color;
        while (color !== 'Y' && color !== 'y' &&
            color !== 'G' && color !== 'g' &&
            color !== 'R' && color !== 'r' &&
            color !== 'B' && color !== 'b') {
            color = prompt("Choose your Color! (Y = Yellow, G = Green, R = Red, B = Blue");
        }
        console.log(color);
        sock.emit('playCard', data, playerTurn, direction, color, drawCounter);
    } else {
        sock.emit('playCard', data, playerTurn, direction, "", drawCounter);
    }
}

function drop(data, playerTurn, direction, currentPlayer, color, drawCounter) {
    var card = document.getElementById(data);
    card.classList.add('selected');
    document.getElementById('onpile').append(card);

    let handCards = document.getElementById('player' + playerTurn).children;
    let current = document.getElementById('onpile').children;
    if (current.length > 0) {
        current[current.length - 2].classList.add('pile');
    }
    document.getElementById('playerIndicator' + playerTurn).classList.remove('turnIndicator');
    current[current.length - 1].classList.remove('drop');
    current[current.length - 1].removeAttribute('ondragstart');

    if (handCards.length == 2) {
        confirmedUno = confirm("UNO!");
        if (!confirmedUno) {
            drawCounter = 2;
            drawPunishment();
        }
    }

    if (handCards.length == 1) {
        alert('Player ' + playerTurn + ' won the game!');
        sock.emit('unoWon', playerTurn);
    }

    for (let i = 0; i < handCards.length; i++) {
        if (currentPlayer !== playerTurn) {
            handCards[i].classList.remove('selected');
        }

        handCards[i].classList.remove('drop');
        handCards[i].removeAttribute('ondragstart');
    }
    return checkEvent(current[current.length - 1], direction, playerTurn, color, drawCounter, currentPlayer);

}

function turn(number, bool, drawCounter) {
    isDeckEmpty();

    let handCards = document.getElementById('player' + number).children;
    let current = document.getElementById('onpile').children;

    document.getElementById('playerIndicator' + number).classList.add('turnIndicator');

    if (drawCounter === 0) {
        for (let i = 0; i < handCards.length; i++) {
            if ((handCards[i]['dataset']['color'] === current[current.length - 1]['dataset']['color'] ||
                    handCards[i]['dataset']['type'] === current[current.length - 1]['dataset']['type'] ||
                    handCards[i]['dataset']['color'] === 'Black' ||
                    handCards[i]['dataset']['type'] === 'Wild' ||
                    handCards[i]['dataset']['type'] === 'Draw4') && bool) {
                handCards[i].setAttribute('ondragstart', "drag(event)");
                handCards[i].classList.add('drop');
            }
        }
    } else {
        for (let i = 0; i < handCards.length; i++) {
            if (handCards[i]['dataset']['type'] === current[current.length - 1]['dataset']['type'] && bool) {
                handCards[i].setAttribute('ondragstart', "drag(event)");
                handCards[i].classList.add('drop');
            }
        }
    }
}

function directionTurnEvent(clockWise, playerTurn) {
    var newData = [];
    if (clockWise === true) {
        newData[0] = true;
        playerTurn++;
    } else {
        newData[0] = false;
        playerTurn += 3;
    }

    switch (playerTurn % 4) {
        case 0:
            playerTurn = 4;
            break;
        case 1:
            playerTurn = 1;
            break;
        case 2:
            playerTurn = 2;
            break;
        case 3:
            playerTurn = 3;
            break;
    }
    newData[1] = playerTurn;
    newData[2] = drawCounter;
    return newData;
}

function checkEvent(currentCard, direction, playerTurn, color, drawCounter, currentPlayer) {
    switch (currentCard['dataset']['type']) {
        case 'Skip': {
            if (direction === true) {
                return directionTurnEvent(direction, playerTurn + 1, drawCounter);
            } else {
                return directionTurnEvent(direction, playerTurn + 3, drawCounter);
            }
        }

        case 'Reverse': {
            if (direction === true) {
                direction = false;
            } else {
                direction = true;
            }
            return directionTurnEvent(direction, playerTurn, drawCounter);
        }

        case 'Draw2': {
            let draw = true;
            let newData = [];
            newData = directionTurnEvent(direction, playerTurn, drawCounter);
            newData[2] = parseInt(drawCounter + 2);

            let handCards = document.getElementById('player' + newData[1]).children;

            for (let i = 0; i < handCards.length; i++) {
                if (handCards[i]['dataset']['type'] === 'Draw2') {
                    document.getElementById("ondeck").removeAttribute('onclick');
                    draw = false;
                }
            }

            if (draw) {
                newData[2] = drawPunishment(newData[2], newData[1], currentPlayer);
                return directionTurnEvent(newData[0], newData[1], newData[2]);
            } else {
                return newData;
            }
        }

        case 'Wild': {
            chooseColor(currentCard, color);
            return directionTurnEvent(direction, playerTurn, drawCounter);
        }

        case 'Draw4': {
            let draw = true;
            let newData = [];
            chooseColor(currentCard, color);
            newData = directionTurnEvent(direction, playerTurn, drawCounter);
            newData[2] = parseInt(drawCounter + 4);
            console.log(newData[2]);
            let handCards = document.getElementById('player' + newData[1]).children;

            for (let i = 0; i < handCards.length; i++) {
                if (handCards[i]['dataset']['type'] === 'Draw4') {
                    document.getElementById("ondeck").removeAttribute('onclick');
                    draw = false;
                }
            }

            if (draw) {
                newData[2] = drawPunishment(newData[2], newData[1], currentPlayer);
                return directionTurnEvent(newData[0], newData[1], newData[2]);
            } else {
                return newData;
            }
        }
        default:
            return directionTurnEvent(direction, playerTurn, drawCounter);
    }

}

function chooseColor(currentCard, color) {


    switch (color) {
        case 'Y':
        case 'y':
            currentCard['dataset']['color'] = 'Yellow';
            break;
        case 'G':
        case 'g':
            currentCard['dataset']['color'] = 'Green';
            break;
        case 'R':
        case 'r':
            currentCard['dataset']['color'] = 'Red';
            break;
        case 'B':
        case 'b':
            currentCard['dataset']['color'] = 'Blue';
            break;
    }
}

function drawPunishment(drawCounter, playerTurn, currentPlayer) {

    let deck = document.getElementById("ondeck").children;
    let handCards = document.getElementById('player' + playerTurn);
    for (let i = 0; i < drawCounter; i++) {
        if (deck.length === 0) {
            break;
        }
        if (currentPlayer === playerTurn) {
            deck[deck.length - 1].classList.add('selected');
        }

        handCards.append(deck[deck.length - 1]);
    }
    drawCounter = 0;
    return drawCounter;
}