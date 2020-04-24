import dotboxCss from "../../css/dot-box.css"
import foundationCss from "../../css/foundation.css"
import DotBoxSocketManager from "./socket-mangaer"

const colors = ["burlywood", "cadetblue"]
const playerColors = { A: colors[0], B: colors[1] }

const size = 10
const dots = []
const lines = []
const distance = 6
for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
        const dotId = (i - 1) * size + j
        dots.push({
            x: j * distance,
            y: i * distance,
            id: `${dotId}`,
            color: colors[dotId % 2],
        })
        if (j > 1) {
            lines.push({
                x1: (j - 1) * distance,
                y1: i * distance,
                x2: j * distance,
                y2: i * distance,
                id: `${(i - 1) * size + (j - 1)}-${(i - 1) * size + j}`,
                stroke: "lightgrey",
                strokeWidth: ".8",
            })
            lines.push({
                x1: i * distance,
                y1: (j - 1) * distance,
                x2: i * distance,
                y2: j * distance,
                id: `${(j - 2) * size + i}-${(j - 1) * size + i}`,
                stroke: "lightgrey",
                strokeWidth: ".8",
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
            console.log("pair: ", pair, min)
            if (pair[0] < min) {
                min = pair[0]
                minimalIndexPair = pair
            }
        })
        const id = `${minimalIndexPair[0]}-${minimalIndexPair[1]}`
        const line = linesHash[id]
        console.log("line-pair", line)
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

const vertexToLines = (vertex) => {
    const id = `${vertex.pair[0]}-${vertex.pair[1]}`
    const line = linesHash[id]
    if (line) {
        line.stroke = "black"
        line.strokeWidth = 1
    }
}

const updateStatesToVM = (state, vm, currentPlayer) => {
    if (!state.players.B) {
        vm.success = "Game started. Wait for your partner to join"
        vm.showGrid = false
        return
    }
    vm.showGrid = true
    vm.gameDone = state.game_done
    vm.players = state.players
    vm.points = state.points
    vm.isMyTurn = {
        A: state.players[state.current_turn] === "A",
        B: state.players[state.current_turn] === "B",
    }
    state.vertices.forEach(vertexToLines)
    vm.boxes = fillBoxes(state.boxes)
}

const bindSocketEvents = (socketManager, vm) => {
    socketManager.registerEventCalls("line_marked", (resp) => {
        console.log("Line marked", resp.state.vertices)
        updateStatesToVM(resp.state, vm, socketManager.getPlayer())
    })
    socketManager.registerEventCalls("state", (resp) => {
        console.log("State got published marked", resp.state.vertices)
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

$(document).ready(function () {
    const socketManager = new DotBoxSocketManager()
    const vm = new Vue({
        el: "#dot-box-container",
        data: {
            isMyTurn: { A: false, B: false },
            showGrid: false,
            gameNotStarted: true,
            gameDone: false,
            points: { A: 0, B: 0 },
            error: "",
            success: "",
            dots: [],
            lines: [],
            boxes: [],
            markedLines: [],
            players: { A: "", B: "" },
            playerColors,
            style: {
                A: { backgroundColor: "burlywood" },
                B: { backgroundColor: "cadetblue" },
            },
        },
        methods: {
            mark: (event) => {
                const id = event.target.id
                if (id) {
                    console.log(id)
                    const points = id.split("-")
                    console.log(points)
                    socketManager.markLine(
                        parseInt(points[0].trim()),
                        parseInt(points[1])
                    )
                }
            },
        },
    })
    bindEvents(vm, socketManager)
})
