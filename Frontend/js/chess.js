var socket = io.connect('http://localhost:8080');
var turn = 0;
var currentColor;
let protectTheKing = [];
//let legitMoves = [];

function initChess() {
    var name = document.getElementById('chessName').value;
    socket.emit('joinGame', name);

    document.getElementById("chessName").disabled = true;
    document.getElementById("chessButton").disabled = true;
}


socket.on('startGame', (players) => {
    var currentName = document.getElementById('chessName').value;
    for (let i = 0; i < 2; i++) {
        if (players[i].name == currentName) {
            currentColor = players[i].color;
        }
    }
    initBoard();
    initFigures(currentColor);
})

socket.on("moveFigure", (data) => {
    let figure = document.getElementById(data[0]);
    moveFigure(figure, data[1], true);
    turn = data[2];
})

socket.on("deletePawn", (data) => {
    let figure = document.getElementById(data[0]);
    swap(figure, data[1], true);
})

socket.on("wait", (message) => {
    alert(message);
})

socket.on("Check", () => {
    alert(currentColor + " king is checked!");
    let nextMove = [];
    let counter = 0;
    protectTheKing = [];

    for (row = 1; row <= 8; row++) {
        for (col = 1; col <= 8; col++) {
            id = row.toString() + col.toString();
            let field = document.getElementById(id);
            if (field.hasChildNodes()) {
                if (currentColor == "black") {
                    if (field.firstChild.id.slice(0, 1) == "b") {
                        nextMove = figureTypeMove(field.firstChild, true);
                        counter = stefanStinkt(nextMove, field, counter, "bK");
                    }
                } else if (currentColor = "white") {
                    if (field.firstChild.id.slice(0, 1) == "w") {
                        nextMove = figureTypeMove(field.firstChild, true);
                        counter = stefanStinkt(nextMove, field, counter, "wK");
                    }
                }
            }
        }
    }

    if (protectTheKing.length == 0) {
        alert("Checkmate, " + currentColor + " has lost the game!");
        socket.emit("Checkmate", currentColor);
        window.location.replace("../Frontend/");
    }

})

socket.on("Checkmate", (color) => {
    alert("Checkmate, " + color + " has lost the game!");
    window.location.replace("../Frontend/");
})

socket.on('forceDisconnect', (data) => {
    window.location.replace("../Frontend/");
});

function stefanStinkt(nextMove, field, counter, kingId) {
    for (let i = 0; i < nextMove.length; i++) {
        let nextField = document.getElementById(nextMove[i]);
        if (nextField != null) {
            if (nextField.hasChildNodes()) {
                nextField.insertBefore(field.firstChild, nextField.firstChild);
            } else {
                nextField.appendChild(field.firstChild);
            }
            if (!checkCheck(document.getElementById(kingId), true, true)) {
                let tempArr = [];
                tempArr[0] = nextField.firstChild;
                tempArr[1] = nextField;
                protectTheKing[counter] = tempArr;
                counter++;
            }
            field.append(nextField.firstChild);
        }
    }
    return counter;
}

function initBoard() {
    const board = document.querySelector(".chessBoard");
    const boardLetters = document.querySelector(".letters");
    const boardNumbers = document.querySelector(".numbers");
    let letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let index = 0;
    let black = false;
    let number = 1;
    let row = 1;
    let column = 1;

    for (let i = 0; i < 8; i++) {
        let letter = document.createElement("li");
        letter.textContent = letters[i];
        boardLetters.appendChild(letter);
        let liNumbers = document.createElement("li");
        liNumbers.textContent = number++;

        boardNumbers.append(liNumbers);
    }

    for (let i = 0; i < 64; i++) {
        square = document.createElement("div");
        if (black) {
            square.classList.add("square");
            square.classList.add("black");
            index++;
            black = !black;
        } else {
            square.classList.add("square");
            square.classList.add("white");
            index++;
            black = !black;
        }
        //square.id = row + letters[i % 8];
        square.id = row.toString() + column.toString();
        column++;
        board.appendChild(square);
        if (index === 8) {
            black = !black;
            row++;
            column = 1;
            index = 0;
        }
    }
}

function initFigures(currentColor) {
    let row = 7;
    let path = "img/chess/b";
    black = true;

    for (i = 0; i < 2; i++) {
        for (let col = 1; col <= 8; col++) {
            let field = document.getElementById("" + row + col /*letters[col]*/ + "");
            let img = document.createElement('img');
            img.src = path + 'P.png';
            img.style.cursor = "pointer";
            if (black && currentColor == "black") {
                img.setAttribute("onclick", "movePawn(this)");
            } else if (!black && currentColor == "white") {
                img.setAttribute("onclick", "movePawn(this)");
            }
            switch (black) {
                case true:
                    img.id = "bP" + col;
                    img.dataset.team = "black";
                    break;
                case false:
                    img.id = "wP" + col;
                    img.dataset.team = "white";
            }
            field.appendChild(img);
        }

        if (row == 2) {
            row--;
        } else {
            row++;
        }


        for (let col = 1; col <= 8; col++) {
            let field = document.getElementById("" + row + col /*letters[col]*/ + "")
            let img = document.createElement('img');
            img.style.cursor = "pointer";

            if (col == 1 || col == 8) {
                img.src = path + 'R.png';
                if (black && currentColor == "black") {
                    img.setAttribute("onclick", "moveRook(this)");
                } else if (!black && currentColor == "white") {
                    img.setAttribute("onclick", "moveRook(this)");
                }
                switch (black) {
                    case true:
                        img.id = "bR" + col;
                        img.dataset.team = "black";
                        break;
                    case false:
                        img.id = "wR" + col;
                        img.dataset.team = "white";
                }
            } else if (col == 2 || col == 7) {
                img.src = path + 'N.png';
                if (black && currentColor == "black") {
                    img.setAttribute("onclick", "moveKnight(this)");
                } else if (!black && currentColor == "white") {
                    img.setAttribute("onclick", "moveKnight(this)");
                }
                switch (black) {
                    case true:
                        img.id = "bN" + col;
                        img.dataset.team = "black";
                        break;
                    case false:
                        img.id = "wN" + col;
                        img.dataset.team = "white";
                }
            } else if (col == 3 || col == 6) {
                img.src = path + 'B.png';
                if (black && currentColor == "black") {
                    img.setAttribute("onclick", "moveBishop(this)");
                } else if (!black && currentColor == "white") {
                    img.setAttribute("onclick", "moveBishop(this)");
                }
                switch (black) {
                    case true:
                        img.id = "bB" + col;
                        img.dataset.team = "black";
                        break;
                    case false:
                        img.id = "wB" + col;
                        img.dataset.team = "white";
                }
            } else if (col == 4) {
                img.src = path + 'K.png';
                if (black && currentColor == "black") {
                    img.setAttribute("onclick", "moveKing(this)");
                } else if (!black && currentColor == "white") {
                    img.setAttribute("onclick", "moveKing(this)");
                }
                switch (black) {
                    case true:
                        img.id = "bK";
                        img.dataset.team = "black";
                        break;
                    case false:
                        img.id = "wK";
                        img.dataset.team = "white";
                }
            } else {
                img.src = path + 'Q.png';
                if (black && currentColor == "black") {
                    img.setAttribute("onclick", "moveQueen(this)");
                } else if (!black && currentColor == "white") {
                    img.setAttribute("onclick", "moveQueen(this)");
                }
                switch (black) {
                    case true:
                        img.id = "bQ";
                        img.dataset.team = "black";
                        break;
                    case false:
                        img.id = "wQ";
                        img.dataset.team = "white";
                }
            }
            field.appendChild(img);
        }
        row = 2;
        path = "img/chess/w";
        black = !black;
    }
}

function checkPawnField(move, color) {
    if (color == "white") {
        if (move > 80 && move < 89) {
            return true;
        }
    } else {
        if (move > 10 && move < 19) {
            return true;
        }
    }
    return false;
}

function swap(figure, newParentId, serverMsg) {

    let img = document.createElement('img');
    let parent = figure.parentElement;
    if (figure.dataset.team == "white") {
        img.src = "img/chess/wQ.png";
        img.dataset.team = "white";
        img.id = "wQ" + turn;
    } else {
        img.src = "img/chess/bQ.png";
        img.dataset.team = "black";
        img.id = "bQ" + turn;
    }
    if (!serverMsg) {
        let data = [figure.id, newParentId];
        socket.emit("deletePawn", data);
        img.setAttribute("onclick", "moveQueen(this)");
    }

    img.style.cursor = "pointer";
    parent.removeChild(figure);
    parent.append(img);
    moveFigure(img, newParentId, serverMsg);
}

// Läufer move
function moveBishop(child) {
    removeBorder();
    let childId = child.id;
    let nextMove = [];

    let moveFields = [];
    moveFields[0] = 9;
    moveFields[1] = 11;

    nextMove = possibleMoves(child, moveFields, 4);
    showMoves(nextMove, childId);
}

// Königin move
function moveQueen(child) {
    removeBorder();
    let childId = child.id;
    let nextMove = [];

    let moveFields = [];
    moveFields[0] = 1;
    moveFields[1] = 9;
    moveFields[2] = 10;
    moveFields[3] = 11;

    nextMove = possibleMoves(child, moveFields, 8);
    showMoves(nextMove, childId);
}

// Turm move
function moveRook(child) {
    removeBorder();
    let childId = child.id;

    let moveFields = [];
    moveFields[0] = 1;
    moveFields[1] = 10;

    nextMove = possibleMoves(child, moveFields, 4);
    showMoves(nextMove, childId);
}

function possibleMoves(child, moveFields, movesNumber) {
    let enemyColor;
    let moveCounter = 0;
    let fieldId = child.parentElement.id;
    let nextMove = [];
    let move = [];
    let noMoves = false;

    if (child.dataset.team == "black") {
        enemyColor = "white";
    } else {
        enemyColor = "black";
    }
    for (let i = 0; i < (movesNumber / 2); i++) {
        move[i] = document.getElementById(fieldId - moveFields[i]);
        move[i + (movesNumber / 2)] = document.getElementById(parseInt(fieldId) + parseInt(moveFields[i]));

    }

    while (!noMoves) {
        let counter = 0;
        for (let i = 0; i < movesNumber; i++) {
            if (move[i] != null && (!move[i].hasChildNodes() || move[i].firstChild.dataset.team == enemyColor)) {
                nextMove[moveCounter] = move[i].id;

                if (move[i].hasChildNodes()) {
                    move[i] = null;
                } else {
                    if (i >= (movesNumber / 2)) {
                        move[i] = document.getElementById(parseInt(move[i].id) + parseInt(moveFields[i - (movesNumber / 2)]));
                    } else {
                        move[i] = document.getElementById(move[i].id - moveFields[i]);
                    }

                }
                moveCounter++;
            } else {
                move[i] = null;
                counter++;
            }
        }
        if (counter == movesNumber) {
            noMoves = !noMoves;
        }
    }
    return nextMove;
}

// König move
function moveKing(child) {
    removeBorder();
    let childId = child.id;
    let nextMove = [];

    let moveFields = [];
    moveFields[0] = 1;
    moveFields[1] = 9;
    moveFields[2] = 10;
    moveFields[3] = 11;

    nextMove = possibleMovesK(child, moveFields, 8);

    showMoves(nextMove, childId);
}

// Springer move
function moveKnight(child) {
    removeBorder();
    let childId = child.id;
    let nextMove = [];

    let moveFields = [];
    moveFields[0] = 8;
    moveFields[1] = 12;
    moveFields[2] = 19;
    moveFields[3] = 21;

    nextMove = possibleMovesK(child, moveFields, 8);

    showMoves(nextMove, childId);
}

function possibleMovesK(child, moveFields, movesNumber) {
    let figureType = child.id.slice(1, 2);
    let enemyColor;
    let moveCounter = 0;
    let fieldId = child.parentElement.id;
    let nextMove = [];
    let move = [];

    if (child.dataset.team == "black") {
        enemyColor = "white";
    } else {
        enemyColor = "black";
    }
    for (let i = 0; i < (movesNumber / 2); i++) {
        move[i] = document.getElementById(fieldId - moveFields[i]);
        move[i + (movesNumber / 2)] = document.getElementById(parseInt(fieldId) + parseInt(moveFields[i]));

    }

    for (let i = 0; i < movesNumber; i++) {
        if (move[i] != null && (!move[i].hasChildNodes() || move[i].firstChild.dataset.team == enemyColor)) {
            if (figureType == "K") {
                let field = child.parentElement;
                if (move[i].hasChildNodes()) {
                    move[i].insertBefore(field.firstChild, move[i].firstChild);
                } else {
                    move[i].appendChild(field.firstChild);
                }
                if (!checkCheck(child, true, false)) {
                    nextMove[moveCounter] = move[i].id;
                }
                field.append(move[i].firstChild);
            } else {
                nextMove[moveCounter] = move[i].id;
            }

            if (move[i].hasChildNodes()) {
                move[i] = null;
            }
            moveCounter++;
        } else {
            move[i] = null;
        }
    }
    return nextMove;
}

function showMoves(possibleMoves, childId) {
    possibleMoves = checkMove(possibleMoves, childId);
    let figureType = childId.slice(1, 2);
    let child = document.getElementById(childId);
    let checkColor;
    if (turn % 2 == 0) {
        checkColor = "white";
    } else {
        checkColor = "black";
    }
    if (checkColor == currentColor) {
        for (let i = 0; i < possibleMoves.length; i++) {
            if (possibleMoves[i] != null) {
                if (protectTheKing.length != 0) {
                    for (let j = 0; j < protectTheKing.length; j++) {
                        if (possibleMoves[i] == protectTheKing[j][1].id && childId == protectTheKing[j][0].id) {
                            document.getElementById(possibleMoves[i]).setAttribute("onclick", "moveFigure(" + childId + "," + possibleMoves[i] + "," + false + ")");
                            document.getElementById(possibleMoves[i]).classList.add("possibleMove");
                        }
                    }
                } else {
                    if (figureType == "P") {
                        if (checkPawnField(possibleMoves[i], child.dataset.team)) {
                            document.getElementById(possibleMoves[i]).setAttribute("onclick", "swap(" + childId + "," + possibleMoves[i] + "," + false + ")");
                            document.getElementById(possibleMoves[i]).classList.add("possibleMove");
                        } else {
                            document.getElementById(possibleMoves[i]).setAttribute("onclick", "moveFigure(" + childId + "," + possibleMoves[i] + "," + false + ")");
                            document.getElementById(possibleMoves[i]).classList.add("possibleMove");
                        }
                    } else {
                        document.getElementById(possibleMoves[i]).setAttribute("onclick", "moveFigure(" + childId + "," + possibleMoves[i] + "," + false + ")");
                        document.getElementById(possibleMoves[i]).classList.add("possibleMove");
                    }

                }

            }
        }
    }
}

function moveFigure(figure, newParentId, serverMsg) {
    protectTheKing = [];
    if (!serverMsg) {
        turn++;
        let data = [figure.id, newParentId, turn];
        socket.emit("moveFigure", data);
    }

    let parent = document.getElementById(newParentId);
    if (parent.hasChildNodes()) {
        kill(parent);
    }

    parent.appendChild(figure);
    removeBorder();
    if (!serverMsg) {
        let enemyKing;
        if (currentColor == "white") {
            enemyKing = document.getElementById("bK");
        } else {
            enemyKing = document.getElementById("wK");
        }
        checkCheck(enemyKing, serverMsg, true);
    }
}

function kill(parent) {

    let child = parent.firstChild;
    if (child.id.slice(1, 2) == "K") {
        alert("Game won");
        socket.emit("Won", currentColor);
    }
    parent.removeChild(child);

}

function removeBorder() {
    for (row = 1; row <= 8; row++) {
        for (col = 1; col <= 8; col++) {
            id = row.toString() + col.toString();
            document.getElementById(id).classList.remove("possibleMove");
            document.getElementById(id).removeAttribute("onclick");


        }
    }
}

function checkCheck(king, serverMsg, withKing) {
    let check = false;
    let nextMove = [];

    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            let id = row.toString() + col.toString();
            let figure = document.getElementById(id);
            if (figure.hasChildNodes()) {
                if (king.dataset.team == "black") {
                    if (figure.firstChild.id.slice(0, 1) == "w") {
                        nextMove = figureTypeMove(figure.firstChild, withKing);
                        for (let i = 0; i < nextMove.length; i++) {
                            if (nextMove[i] == king.parentElement.id) {
                                check = true;
                            }
                        }
                    }
                } else if (king.dataset.team == "white") {
                    if (figure.firstChild.id.slice(0, 1) == "b") {
                        nextMove = figureTypeMove(figure.firstChild, withKing);
                        for (let i = 0; i < nextMove.length; i++) {
                            if (nextMove[i] == king.parentElement.id) {
                                check = true;
                            }
                        }
                    }
                }
            }
            if (check) {
                break;
            }
        }
        if (check) {
            break;
        }
    }

    if (check && !serverMsg) {
        socket.emit("Check");
        alert(king.dataset.team + " king is checked!");
    }

    return check;

}

function figureTypeMove(figure, withKing) {
    let figureType = figure.id.slice(1, 2);
    let moveFields = [];
    let nextMove = [];
    switch (figureType) {
        case 'P':
            nextMove = possibleMovesPawn(figure);
            break;
        case 'K':
            if (withKing) {
                moveFields[0] = 1;
                moveFields[1] = 9;
                moveFields[2] = 10;
                moveFields[3] = 11;
                nextMove = possibleMovesK(figure, moveFields, 8);
            }
            break;
        case 'Q':
            moveFields[0] = 1;
            moveFields[1] = 9;
            moveFields[2] = 10;
            moveFields[3] = 11;
            nextMove = possibleMoves(figure, moveFields, 8);
            break;
        case 'B':
            moveFields[0] = 9;
            moveFields[1] = 11;
            nextMove = possibleMoves(figure, moveFields, 4);
            break;
        case 'N':
            moveFields[0] = 8;
            moveFields[1] = 12;
            moveFields[2] = 19;
            moveFields[3] = 21;
            nextMove = possibleMovesK(figure, moveFields, 8);
            break;
        case 'R':
            moveFields[0] = 1;
            moveFields[1] = 10;
            nextMove = possibleMoves(figure, moveFields, 4);
            break;
        default:
            break;

    }
    return nextMove;
}

function possibleMovesPawn(child) {
    let color = child.dataset.team;
    let curFieldID = child.parentNode.id;
    let diagonalField1 = null;
    let diagonalField2 = null;
    let moveFields = [];
    let normalField;
    let specialField;

    if (color == "black") {
        diagonalField1 = document.getElementById(parseInt(curFieldID) - 9);
        diagonalField2 = document.getElementById(parseInt(curFieldID) - 11);
        normalField = document.getElementById(parseInt(curFieldID) - 10);
        specialField = document.getElementById(parseInt(curFieldID) - 20);

        if (normalField != null) {
            if (!normalField.hasChildNodes()) {
                moveFields.push(-10);
            }
        }
        if (curFieldID > 70 && curFieldID < 79) {
            if (!normalField.hasChildNodes() && !specialField.hasChildNodes()) {
                moveFields.push(-20);
            }
        }

    } else {
        diagonalField1 = document.getElementById(parseInt(curFieldID) + 9);
        diagonalField2 = document.getElementById(parseInt(curFieldID) + 11);
        normalField = document.getElementById(parseInt(curFieldID) + 10);
        specialField = document.getElementById(parseInt(curFieldID) + 20);

        if (normalField != null) {
            if (!normalField.hasChildNodes()) {
                moveFields.push(10);
            }
        }
        if (curFieldID > 20 && curFieldID < 29) {
            if (!normalField.hasChildNodes() && !specialField.hasChildNodes()) {
                moveFields.push(20);
            }
        }

    }

    if (diagonalField1 != null && diagonalField1.hasChildNodes()) {
        if (diagonalField1.firstChild.dataset.team != child.dataset.team) {
            if (color == "black") {
                moveFields.push(-9);
            } else if (color == "white") {
                moveFields.push(9);
            }
        }
    }

    if (diagonalField2 != null && diagonalField2.hasChildNodes()) {
        if (diagonalField2.firstChild.dataset.team != child.dataset.team) {
            if (color == "black") {
                moveFields.push(-11);
            } else if (color == "white") {
                moveFields.push(11);
            }
        }
    }

    let array = [];
    for (i = 0; i < moveFields.length; i++) {
        array[i] = parseInt(curFieldID) + parseInt(moveFields[i]);
    }

    return array;
}

function movePawn(child) {
    removeBorder();
    let moveFields = [];

    if (child.dataset.team == "black") {
        moveFields[0] = -10;
    } else {
        moveFields[0] = 10;
    }

    let possibleMoves = possibleMovesPawn(child, moveFields);

    showMoves(possibleMoves, child.id);
}

function checkKing(king, withKing) {
    let check = false;
    let nextMove = [];

    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            let id = row.toString() + col.toString();
            let figure = document.getElementById(id);
            if (figure.hasChildNodes()) {
                if (king.dataset.team == "black") {
                    if (figure.firstChild.id.slice(0, 1) == "w") {
                        nextMove = figureTypeMove(figure.firstChild, withKing);
                        for (let i = 0; i < nextMove.length; i++) {
                            if (nextMove[i] == king.parentElement.id) {
                                check = true;
                            }
                        }
                    }
                } else if (king.dataset.team == "white") {
                    if (figure.firstChild.id.slice(0, 1) == "b") {
                        nextMove = figureTypeMove(figure.firstChild, withKing);
                        for (let i = 0; i < nextMove.length; i++) {
                            if (nextMove[i] == king.parentElement.id) {
                                check = true;
                            }
                        }
                    }
                }
            }
            if (check) {
                break;
            }
        }
        if (check) {
            break;
        }
    }
    return check;
}

//checks if move is valid aka if King would be checked after move
function checkMove(possibleMoves, childid) {
    let figure = document.getElementById(childid);
    let field = figure.parentElement;
    let legitMoves = [];

    for (let i = 0; i < possibleMoves.length; i++) {
        var nextField = document.getElementById(possibleMoves[i]);
        if (nextField != null) {
            if (nextField.hasChildNodes()) {
                nextField.insertBefore(field.firstChild, nextField.firstChild);
            } else {
                nextField.appendChild(field.firstChild);
            }
            if (!checkKing(document.getElementById(figure.id.slice(0, 1) + "K"), true)) {
                legitMoves.push(nextField.id);
            }
            field.append(nextField.firstChild);
        }
    }
    return legitMoves;
}