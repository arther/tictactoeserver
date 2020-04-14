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
  "Losing is part of the game. If you never lose, you are never truly tested, and never forced to grow."
]

const _getInnerboxClass = function (value) {
    return value === "A" ? "x" : "o"
}

const refreshBoxes = function (matrix) {
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
    if(!$('#create-btn').hasClass('hide')){
      $('#create-btn').addClass('hide')
    }
    if(!$('#gamename').hasClass('hide')){
      $('#gamename').addClass('hide')
    }

    if (!$(".result-container").hasClass("hide")) {
        $(".result-container").addClass("hide")
    }
    $(".board").removeClass("hide")
}

const showResult = function (player) {
    $(".result-container").removeClass("hide")
    if (!$(".board").hasClass("hide")) {
        $(".board").addClass("hide")
    }
    $(".result-msg").text("Player " + player + " Won!!!")
    $('#create-btn').removeClass('hide')
    $('#gamename').removeClass('hide')
}

const showTie = function () {
    $(".result-container").removeClass("hide")
    if (!$(".board").hasClass("hide")) {
        $(".board").addClass("hide")
    }
    $(".result-msg").text("Game Tie")
    $('#create-btn').removeClass('hide')
    $('#gamename').removeClass('hide')
}

export default class GameHandler {
    constructor(gamestate) {
        this.state = gamestate
    }

    startGame() {
        showBoard()
    }

    change(state) {
        this.state = state
        refreshBoxes(state.matrix)
    }

    reset() {
        this.state = {}
    }

    tie() {
        showTie()
    }

    won(won) {
        showResult(won ? "!!! You won this round !!!" : "!!! " + quotes[Math.floor(Math.random() * 11)] + " !!!")
    }
}
