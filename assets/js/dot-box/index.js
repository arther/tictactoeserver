import dotboxCss from "../../css/dot-box.css"
import foundationCss from "../../css/foundation.css"
import DotBoxSocketManager from "./socket-mangaer"

const updateStatesToVM = (state, vm) => {
    if(!state.players.B) {
        vm.error = "Wait for your partner"
        vm.showGrid = false
        return;
    }
    vm.showGrid = true
    vm.gameDone = state.game_done
    vm.players = state.players
    vm.points = state.points
    vm.currentTurn = state.current_turn
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
        const size = 6
        socketManager.joinGame(gameName, playerName, size, (err, state) => {
            if(err){
                vm.error = err
                return;
            }
            
            const dots = []
            const lines = []
            const distance = 8
            const colors = ["burlywood", "cadetblue"]
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
                            id: `${(i - 1) * size + (j - 1)} - ${
                                (i - 1) * size + j
                            }`,
                            stroke: "lightgrey"
                        })
                        lines.push({
                            x1: i * distance,
                            y1: (j - 1) * distance,
                            x2: i * distance,
                            y2: j * distance,
                            id: `${(j - 2) * size + i} - ${(j - 1) * size + i}`,
                            stroke: "lightgrey"
                        })
                    }
                }
            }
            vm.dots = dots;
            vm.lines = lines;
            vm.gameNotStarted = false;
            updateStatesToVM(state, vm)
        })
    })
}

$(document).ready(function () {
    const socketManager = new DotBoxSocketManager()
    const vm = new Vue({
        el: "#dot-box-container",
        data: {
            showGrid: false,
            gameNotStarted: true,
            gameDone: false,
            points: {A: 0, B: 0},
            error: "",
            success: "",
            dots: [],
            lines: [],
            boxes: [],
            players: { A: "Alice", B: "Bob" },
            style: {
                A: { backgroundColor: "burlywood" },
                B: { backgroundColor: "cadetblue" },
            },
        },
        methods: {
            mark: (event) => {
                const id = event.target.id;
                if(id){
                    console.log(id)
                    const points = id.split("-")
                    console.log(points)
                    socketManager.markLine(points[0], points[1])
                }
                
            },
        },
    })

    bindEvents(vm, socketManager)
})
