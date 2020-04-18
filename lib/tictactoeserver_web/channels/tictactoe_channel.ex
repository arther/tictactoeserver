require Protocol
Protocol.derive(Jason.Encoder, Tictactoe.GameState)

defmodule TictactoeserverWeb.TictactoeChannel do
  use Phoenix.Channel
  alias Tictactoe.Game

  def join("tictactoe:" <> name, _params, socket) do
    name = name
    |> String.to_atom
    handle_join(socket, name, Game.is_game_alive?(name))
  end

  defp handle_join(socket, name, true) do
    gamestate = Game.get_state(name)

    case gamestate.player_count do
      x when x < 2 ->
        Game.add_player(name)

        socket = socket
        |> assign(:game_name, name)
        |> assign(:player, "B")

        {:ok, %{state: (Game.get_state(name)), player: "B"}, socket}

      _ ->
        {:error, "Game with same name exists"}
    end
  end

  defp handle_join(socket, name, false) do
    Game.start(name)
    Game.add_player(name)

    socket = socket
    |> assign(:game_name, name)
    |> assign(:player, "A")

    {:ok, %{state: (Game.get_state(name)), player: "A"}, socket}
  end

  @spec handle_in(<<_::64, _::_*8>>, map, Phoenix.Socket.t()) :: {:noreply, Phoenix.Socket.t()}
  def handle_in("mark_position_" <> name, %{"position" => position} = _params, socket) do
    name = name |> String.to_atom
    player = socket.assigns.player
    IO.puts("Player: #{player}")
    IO.puts("Player in State: #{Game.get_state(name).player == String.to_atom(player)}")
    mark_position(socket, name, position, String.to_atom(player) == Game.get_state(name).player)
  end

  # def handle_in("close", %{"position" => position} = _params, socket) do
  #   name = socket.assigns.game_name
  #   Game.next_turn(name, position |> String.to_integer)  |> game_over?(name, socket)
  # end

  defp mark_position(socket, name, position, true) do
    IO.puts("Inside mark_position true")
    Game.next_turn(name, position) |> game_over?(name, socket)
  end

  defp mark_position(socket, _name, _position, false) do
    push(socket, "invalid_move", %{msg: "Invalid Move"})
    {:noreply, socket}
  end

  defp game_over?({false, _}, name, socket) do
    broadcast!(socket, "state", Game.get_state(name))
    # push(socket, "state", Game.get_state(name))
    {:noreply, socket}
  end

  defp game_over?({true, nil}, name, socket) do
    broadcast!(socket, "state", Game.get_state(name))
    broadcast!(socket, "tie", %{})
    Game.kill_game(name)
    {:noreply, socket}
  end

  defp game_over?({true, player}, name, socket) do
    broadcast!(socket, "state", Game.get_state(name))
    broadcast!(socket, "won", %{player: player})
    Game.kill_game(name)
    {:noreply, socket}
  end

  def terminate({:shutdown, :closed} = reason, _arg2) do
    IO.puts("Terminating")
    IO.inspect(reason)
    {:stop, :shutdown, :closed}
  end

  def terminate(reason, _arg2) do
    IO.puts("Terminating")
    IO.inspect(reason)
    {:stop, :shutdown, :left}
  end
end
