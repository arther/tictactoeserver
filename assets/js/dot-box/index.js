import dotboxCss from "../../css/dot-box.css"
import foundationCss from "../../css/foundation.css"
import DotBoxSocketManager from "./socket-mangaer"

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
            x: j * distance + .2,
            y: i * distance + .2,
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
                stroke: "#627d8bf0",
                strokeWidth: "1.2",
            })
            lines.push({
                x1: i * distance,
                y1: (j - 1) * distance,
                x2: i * distance,
                y2: j * distance,
                id: `${(j - 2) * size + i}-${(j - 1) * size + i}`,
                stroke: "#627d8bf0",
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
    let color =  "#e6e6e6";
    if(lastLine && (vertex.pair[0] === lastLine[0] && vertex.pair[1] === lastLine[1])){
        color = 'red';
    }
    const id = `${vertex.pair[0]}-${vertex.pair[1]}`
    const line = linesHash[id]
    if (line) {
        line.stroke = color;
        // line.strokeWidth = 1.2
    }
}

const updateStatesToVM = (state, vm, currentPlayer, lastLine) => {
    console.log(currentPlayer)
    if (!state.players.B) {
        vm.success = "Game started. Wait for your partner to join"
        vm.showGrid = false
        return
    }
    vm.success = ""
    vm.showGrid = true
    vm.gameDone = state.game_done
    vm.players = state.players
    vm.points = state.points
    vm.turn = {
        // text: state.players[state.current_turn],
        text: state.players[state.current_turn],
        mine: state.current_turn === currentPlayer
    } 
    console.log(vm.turn)
    state.vertices.forEach(vertex => vertexToLines(vertex, lastLine))
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
        
        updateStatesToVM(resp.state, vm, socketManager.getPlayer(), resp.lastLine)
    })
    socketManager.registerEventCalls("state", (resp) => {
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
            viewBox: viewBox,
            turn: {
                mine: mine,
                text: ""
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
        methods: {
            mark: function(event){
                if(!this.turn.mine){
                    alert("Wait for your turn")
                    return;
                }
                const id = event.target.id
                if (id) {
                    const points = id.split("-")
                    socketManager.markLine(
                        parseInt(points[0].trim()),
                        parseInt(points[1].trim())
                    )
                }
            },
        },
    })
    bindEvents(vm, socketManager)
})
