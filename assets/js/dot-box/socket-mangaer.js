import { Socket } from "phoenix"

export default class DotBoxSocketManager {
    constructor() {
        this.socket = new Socket("/socket", {})
        this.socket.connect()
        this.socket.onOpen(() => (this.hasConnected = true))
        this.socket.onError(() =>{
            console.log("There was an error in socket connection")
            this.socket.close()
        })
        this.socket.onClose(() => {
            console.log("The socket connection dropped")
            this.socket.close()
        })
    }

    registerEventCalls(event, callback) {
        this.channel.on(event, callback)
    }

    getPlayer() {
        return this.player
    }

    joinGame(gamename, playername, size, callback) {
        if (this.channel) {
            this.channel.leave()
        }
        this.gamename = gamename
        this.channel = this.socket.channel("dotsquare:" + gamename, {
            player_name: playername,
            size: size,
        })
        this.channel.onError(() => {
            console.log("There is an error in channel " + gamename)
            this.channel.leave()
        })
        this.channel.onClose(() => {
            console.log(`The ${gamename} channel closed successfully`)
            this.channel.leave()
        })
        this.channel
            .join()
            .receive("ok", (resp) => {
                console.log(
                    `Joined ${gamename} successfully`,
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

    publishState() {
        this.channel.push("dotsquare:pub_state", {})
    }

    markLine(start, end) {
        this.channel.push("dotsquare:mark_line", { start, end })
    }

    killGame() {
        this.channel.push("dotsquare:kill", {})
    }

    close() {
        this.channel.leave()
    }
}
