import dotboxCss from "../../css/dot-box.css"
import foundationCss from "../../css/foundation.css"
import DotBoxSocketManager from "./socket-mangaer"

const codeToMessage = {
    NO_SEAT: "There are enough player already joined",
    ADD_PLAYER_FAILED: "We are facing an issue in adding you",
}
const colors = ["burlywood", "#b97484"]
const playerColors = { A: colors[0], B: colors[1] }

const size = 6
const dots = []
const dotShadows = []
const lines = []
const distance = 6
let mine = false
let dotStrokeWidth = 10
let viewBox = "0 0 40 40"

for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
        const dotId = (i - 1) * size + j
        dots.push({
            x: j * distance,
            y: i * distance,
            id: `${dotId}`,
            strokeWidth: `${dotStrokeWidth}px`,
            color: "#d9d9d9",
        })
        dotShadows.push({
            x: j * distance + 0.2,
            y: i * distance + 0.2,
            id: `${dotId}`,
            strokeWidth: `${dotStrokeWidth}px`,
            color: "#10242f",
        })
        if (j > 1) {
            lines.push({
                x1: (j - 1) * distance,
                y1: i * distance,
                x2: j * distance,
                y2: i * distance,
                id: `${(i - 1) * size + (j - 1)}-${(i - 1) * size + j}`,
                stroke: "rgb(62, 107, 134)",
                strokeWidth: "1.2",
            })
            lines.push({
                x1: i * distance,
                y1: (j - 1) * distance,
                x2: i * distance,
                y2: j * distance,
                id: `${(j - 2) * size + i}-${(j - 1) * size + i}`,
                stroke: "rgb(62, 107, 134)",
                strokeWidth: "1.2",
            })
        }
    }
}

const linesHash = {}
lines.map((line) => (linesHash[line.id] = line))

const setBoxCoordinates = (boxes, player) => {
    return boxes[player].map((box) => {
        let minimalIndexPair = []
        let min = 100000
        box.forEach((pair) => {
            if (pair[0] < min) {
                min = pair[0]
                minimalIndexPair = pair
            }
        })
        const id = `${minimalIndexPair[0]}-${minimalIndexPair[1]}`
        const line = linesHash[id]
        return {
            x: line.x1,
            y: line.y1,
            width: distance,
            height: distance,
            color: playerColors[player],
        }
    })
}

const fillBoxes = (boxes) => {
    return setBoxCoordinates(boxes, "A").concat(setBoxCoordinates(boxes, "B"))
}

const vertexToLines = (vertex, lastLine) => {
    console.log("last_line", lastLine)
    let color = "#e6e6e6"
    if (
        lastLine &&
        vertex.pair[0] === lastLine[0] &&
        vertex.pair[1] === lastLine[1]
    ) {
        color = "red"
    }
    const id = `${vertex.pair[0]}-${vertex.pair[1]}`
    const line = linesHash[id]
    if (line) {
        line.stroke = color
        line.marked = true
    }
}

const updateStatesToVM = (state, vm, currentPlayer, lastLine) => {
    if (state.error) {
        console.log(state.error)
        vm.showGrid = false
        vm.error = codeToMessage[state.error] || state.error
        return
    }
    if (!state.players.A || !state.players.B) {
        vm.success = "Not enough players. Wait for one more player to join"
        vm.showGrid = false
        return
    }
    vm.success = ""
    vm.showGrid = true
    vm.gameDone = state.game_done
    vm.players = state.players
    vm.points = state.points
    vm.turn = {
        text: state.players[state.current_turn],
        mine: state.current_turn === currentPlayer,
    }
    state.vertices.forEach((vertex) => vertexToLines(vertex, lastLine))
    vm.boxes = fillBoxes(state.boxes)
    vm.scores = { A: state.points.A, B: state.points.B }
    if (state.game_done) {
        const scoreOfA = parseInt(state.points.A)
        const scoreOfB = parseInt(state.points.B)
        if (scoreOfA > scoreOfB) {
            vm.winner = state.players.A
        }
        if (scoreOfB > scoreOfA) {
            vm.winner = state.players.B
        }
        if (scoreOfA === scoreOfB) {
            vm.winner = "TIE"
        }
        vm.showGrid = false
    }
}

const bindSocketEvents = (socketManager, vm) => {
    socketManager.registerEventCalls("line_marked", (resp) => {
        updateStatesToVM(
            resp.state,
            vm,
            socketManager.getPlayer(),
            resp.lastLine
        )
    })
    socketManager.registerEventCalls("killed", (resp) => {
        socketManager.close()
    })

    socketManager.registerEventCalls("state", (resp) => {
        if (resp.state & resp.state.game_done) {
            socketManager.killGame()
        }
        updateStatesToVM(resp.state, vm, socketManager.getPlayer())
    })
}

const bindEvents = (vm, socketManager) => {
    $("#dot-box-create-btn").on("click", (event) => {
        vm.error = ""
        const gameName = $("#dot-box-name-id").val()
        const playerName = $("#dot-box-player-name-id").val()
        if (!gameName) {
            vm.error = "Game name cannot be empty"
            return
        }
        if (!playerName) {
            vm.error = "Player name cannot be empty"
            return
        }
        socketManager.joinGame(gameName, playerName, size, (err, state) => {
            if (err) {
                vm.error = err
                return
            }
            vm.dots = dots
            vm.lines = lines
            vm.gameNotStarted = false
            bindSocketEvents(socketManager, vm)
            updateStatesToVM(state, vm, socketManager.getPlayer())
            socketManager.publishState()
        })
    })
}

const bindPathCreationEvent = (vm, socketManager) => {
    let clicking = false
    let point = {}
    let currentPoint = {}
    let startIndex
    $(document).on("mousedown", "#play-area", function (event) {
        if (!vm.turn.mine) {
            alert("Wait for your turn")
            return
        }
        clicking = true
        console.log("MouseDown", event.target.id)
        startIndex = parseInt(event.target.id) - 1
        const x = dots[startIndex].x
        const y = dots[startIndex].y
        currentPoint = { x: x, y: y }
        console.log("mousedown", event.target.id, event.pageX, event.pageY)
        point.x = event.pageX
        point.y = event.pageY
        $("#path").attr("d", "M" + x + "," + y + "L" + x + "," + y)
    })

    $(document).mouseup(function (event) {
        clicking = false
        const index = parseInt(event.target.id) - 1
        const lineId1 = `${startIndex + 1}-${index + 1}`
        const lineId2 = `${index + 1}-${startIndex + 1}`
        if (isNaN(index) || (!linesHash[lineId1] && !linesHash[lineId2])) {
            $("#path").attr("d", "")
            return
        }
        if ((linesHash[lineId1] && linesHash[lineId1].marked) || (linesHash[lineId2] && linesHash[lineId2].marked)) {
            alert("This line already marked")
            $("#path").attr("d", "")
            return
        }
        const x = dots[index].x
        const y = dots[index].y
        $("#path").attr("d", "")
        if (linesHash[lineId1]) {
            socketManager.markLine(
                parseInt(startIndex + 1),
                parseInt(index + 1)
            )
        }
        if (linesHash[lineId2]) {
            socketManager.markLine(
                parseInt(index + 1),
                parseInt(startIndex + 1)
            )
        }
    })

    $(document).on("mousemove", "#play-area", function (event) {
        if (clicking == false) return
        const diffInX = event.pageX - point.x
        const diffInY = event.pageY - point.y
        point.x = event.pageX
        point.y = event.pageY
        currentPoint.x = currentPoint.x + diffInX / 10
        currentPoint.y = currentPoint.y + diffInY / 10
        $("#path").attr(
            "d",
            $("#path").attr("d") + " " + currentPoint.x + " , " + currentPoint.y
        )
    })
}

$(document).ready(function () {
    const socketManager = new DotBoxSocketManager()
    const vm = new Vue({
        el: "#dot-box-container",
        data: {
            viewBox: viewBox,
            turn: {
                mine: mine,
                text: "",
            },
            showGrid: false,
            gameNotStarted: true,
            gameDone: false,
            points: { A: 0, B: 0 },
            error: "",
            success: "",
            dots: [],
            dotShadows: dotShadows,
            lines: [],
            boxes: [],
            markedLines: [],
            scores: { A: 0, B: 0 },
            winner: "",
            players: { A: "", B: "" },
            playerColors,
            style: {
                A: { backgroundColor: "burlywood" },
                B: { backgroundColor: "cadetblue" },
            },
        },
    })

    bindPathCreationEvent(vm, socketManager)
    bindEvents(vm, socketManager)
})
