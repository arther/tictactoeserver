import { Socket } from "phoenix"

export default class TictactoeSocket {
    constructor() {
        this.socket = new Socket("/socket", {})
        this.socket.connect()
        this.socket.onOpen(() => (this.hasConnected = true))
        this.socket.onError(() =>
            console.log("there was an error with the connection!")
        )
        this.socket.onClose(() => console.log("the connection dropped"))
    }

    registerEventCalls(event, callback) {
        this.channel.on(event, callback)
    }

    playerName() {
        return this.player
    }

    joinGame(gamename, callback) {
        if (this.channel) {
            this.channel.leave()
        }
        this.gamename = gamename
        this.channel = this.socket.channel("tictactoe:" + gamename, {
            name: gamename,
        })
        this.channel.onError(() => console.log("there was an error in channel"))
        this.channel.onClose(() =>
            console.log("the channel has gone away gracefully")
        )
        this.channel
            .join()
            .receive("ok", (resp) => {
                console.log(
                    "Joined successfully " + gamename,
                    resp,
                    this.channel.player
                )
                this.player = resp.player
                callback(null, resp.state)
            })
            .receive("error", (resp) => {
                console.error(resp)
                callback(resp)
                this.channel.leave()
            })
    }

    markPositon(position) {
        this.channel.push("mark_position_" + this.gamename, {
            position: parseInt(position),
        })
    }

    close() {
        this.channel.leave()
    }
}
