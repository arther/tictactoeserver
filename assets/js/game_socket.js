import TictactoeSocket from './tictactoe_socket'
import GameHandler from './game_handler'

$(document).ready(() => {
    const tictactoeSocket = new TictactoeSocket()
    const gameHandler = new GameHandler({})
    $('#create-btn').on('click', (e) => {
        const gamename = $('#gamename').val()
        if(!gamename){
            $('.alert-error').text("Enter valid game name")
            return;
        }
        $('.alert-error').text()
        tictactoeSocket.joinGame(gamename, (err, gamestate) => {
            if(err){
                $('.alert-error').text(err)
                return
            }
            $('.alert-success').text("You are in game now")
            tictactoeSocket.registerEventCalls("tie", () => {
                gameHandler.tie()
                tictactoeSocket.close()
            })
            tictactoeSocket.registerEventCalls("state", (state) => {
                console.log(state)
                gameHandler.change(state)
            })
        })
    })

    $(".box").on('click', function (event) {
        tictactoeSocket.markPositon(event.target.id);
    });
})
