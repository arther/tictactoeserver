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

const refreshBoxes = function (state) {
    const matrix = state.matrix
    const boxes = $(".box-content")
    boxes.each(function (index, element) {
        const value = matrix[index]
        if (value !== "x") {
            const className = _getInnerboxClass(value)
            $(element).addClass(className)
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
    if (!$(".board").hasClass("hide")) {
        $(".board").addClass("hide")
    }
    $(".result-msg").text(msg)
    $("#create-btn").show()
    $("#gamename").removeClass("hide")
}

const showTie = function () {
    $(".result-container").removeClass("hide")
    if (!$(".board").hasClass("hide")) {
        $(".board").addClass("hide")
    }
    $(".result-msg").text("Game Tie")
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

export default class GameHandler {
    constructor(state) {
        this.state = state
    }

    startGame(gamename, state, playerName) {
        showBoard()
        showGameName(gamename)
        refreshBoxes(state)
        toggleTurn(playerName === state.player)
    }

    change(state, playerName) {
        this.state = state
        refreshBoxes(state)
        toggleTurn(playerName === state.player)
    }

    reset() {
        this.state = {}
    }

    tie() {
        showTie()
        this.reset()
    }

    won(won) {
        won
            ? showResult("!!! You won the game !!!")
            : showResult(
                  "!!! " + quotes[Math.floor(Math.random() * 11)] + " !!!"
              )
        this.reset()
    }
}
