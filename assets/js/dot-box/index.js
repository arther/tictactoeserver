import dotboxCss from "../../css/dot-box.css"
import foundationCss from "../../css/foundation.css"
import DotBoxSocketManager from "./socket-mangaer"

const updateStatesToVM = (state, vm) => {
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
        socketManager.joinGame(gameName, playerName, (err, state) => {
            if(err){
                vm.error = err
                return;
            }
            const size = 10
            const dots = []
            const lines = []
            const distance = 6
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
            updateStatesToVM(state, vm)
        })
    })
}

$(document).ready(function () {
    const socketManager = new DotBoxSocketManager()
    const vm = new Vue({
        el: "#dot-box-container",
        data: {
            game_done: false,
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
                alert(event.target.id)
            },
        },
    })

    bindEvents(vm, socketManager)
})
