require Protocol
Protocol.derive(Jason.Encoder, DotSquare.State)

defmodule TictactoeserverWeb.DotSuqareChannel do
  use Phoenix.Channel
  require DotSquare

  def join("dotsquare:" <> name, %{"player_name" => player_name} = _param, socket) do
    name = name
    |> String.to_atom
    handle_join_resp(socket, name, player_name, DotSquare.is_game_alive?(name))
  end

  defp handle_join_resp(socket, game_id, player_name, false = _game_exists) do
    {:ok, game_id, _state} = DotSquare.start(game_id, 10)
    state = DotSquare.add_player(game_id, :A, player_name)
    socket = socket
        |> assign(:game_id, game_id)
        |> assign(:player, :A)
    {:ok, %{state: state}, socket}
  end

  defp handle_join_resp(socket, game_id, player_name, true = _game_exists) do
    state = DotSquare.add_player(game_id, :B, player_name)
    socket = socket
        |> assign(:game_id, game_id)
        |> assign(:player, :B)
    {:ok, %{state: state}, socket}
  end

  def handle_in("dotsquare:add_player", %{"player_name" => player_name} = _params, socket) do
    game_id = socket.assigns.game_id
    state = DotSquare.add_player(game_id, :B, player_name)
    broadcast!(socket, "player_joined", %{state: state})
    {:noreply, socket}
  end

  def handle_in("dotsquare:mark_line", %{"start" => start_point, "end"=> end_point} = _params, socket) do
    game_id = socket.assigns.game_id
    {:ok, state} = DotSquare.add_vertex(game_id, start_point, end_point)
    broadcast!(socket, "line_marked", %{state: state})
    {:noreply, socket}
  end

  def handle_in("dotsquare:kill", _params, socket) do
    game_id = socket.assigns.game_id
    DotSquare.kill(game_id)
    broadcast!(socket, "killed", %{})
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
