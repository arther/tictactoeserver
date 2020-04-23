import css from "../css/game.css"

const quotes = [
    "Its not whether you win or lose, its how you play the game",
    "Losing isn't always the end, sometimes it becomes the beginning",
    "There's such a thin line between winning and losing",
    "You can't win unless you learn how to lose",
    "Winning provides happiness. Losing provides wisdom.",
    "Sometimes You Win, Sometimes You Lose",
    "Sometimes by losing a battle you find a new way to win the war",
    "When I lose a match, I know that I lose on the court and not in life",
    "Victory is fleeting. Losing is forever.",
    "Losing is part of the game. If you never lose, you are never truly tested, and never forced to grow.",
]

const _getInnerboxClass = function (value) {
    return value === "A" ? "x" : "o"
}

const resetBox = function() {
    const boxes = $(".box-content")
    boxes.each(function (index, element) {
        $(element).removeClass("o")
        $(element).removeClass("x")
    })
}

const refreshBoxes = function (state) {
    const matrix = state.matrix
    const boxes = $(".box-content")
    boxes.each(function (index, element) {
        const value = matrix[index]
        console.log("value", index, value);
        if (value !== "x") {
            const className = _getInnerboxClass(value)
            $(element).addClass(className)
            return;
        }
        
        if (value === "x") {
            $(element).removeClass("o")
            $(element).removeClass("x")
        }
    })
}

const showBoard = function () {
    $("#create-btn").hide()
    if (!$("#gamename").hasClass("hide")) {
        $("#gamename").addClass("hide")
    }

    if (!$(".result-container").hasClass("hide")) {
        $(".result-container").addClass("hide")
    }
    $(".board").removeClass("hide")
}

const showResult = function (msg, cls) {
    $(".result-container").removeClass("hide")
    $(".result-msg").text(msg + " Start a new game ")
    $("#create-btn").show()
    $("#gamename").removeClass("hide")
}

const showTie = function () {
    $(".result-container").removeClass("hide")
    $(".result-msg").text("Game Tie !!! Start a new game")
    $("#create-btn").show()
    $("#gamename").removeClass("hide")
}

const showGameName = function (name) {
    $(".welcome-banner").text("You are in game " + name)
}

const toggleTurn = function (isMyTurn) {
    if (!$(".board").hasClass("turn-active") && isMyTurn) {
        $(".board").addClass("turn-active")
    }
    if ($(".board").hasClass("turn-active") && !isMyTurn) {
        $(".board").removeClass("turn-active")
    }
}

export default class TictactoeHandler {
    constructor(state) {
        this.state = state
    }

    startGame(gamename, state, playerName) {
        showBoard()
        this.reset()
        showGameName(gamename)
        refreshBoxes(state)
        toggleTurn(playerName === state.player)
    }

    change(state, playerName) {
        this.state = state
        refreshBoxes(state)
        console.log("change", playerName, state.player)
        toggleTurn(playerName === state.player)
    }

    reset() {
        this.state = {}
        resetBox()
    }

    tie() {
        showTie()
    }

    won(won) {
        won
            ? showResult("!!! You won the game !!!")
            : showResult(
                  "!!! Better luck next time !!!"
              )
    }
}
