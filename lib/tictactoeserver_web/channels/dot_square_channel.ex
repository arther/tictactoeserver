require Protocol
Protocol.derive(Jason.Encoder, DotSquare.State)
Protocol.derive(Jason.Encoder, DotSquare.Vertex)

defimpl Jason.Encoder, for: Tuple do
  def encode(data, options) when is_tuple(data) do
    data
    |> Tuple.to_list()
    |> Jason.Encoder.encode(options)
  end
end

defmodule TictactoeserverWeb.DotSuqareChannel do
  use Phoenix.Channel
  require DotSquare

  def join("dotsquare:" <> name, %{"player_name" => player_name, "size" => size} = _param, socket) do
    name =
      name
      |> String.to_atom()

    handle_join_resp(socket, name, player_name, size, DotSquare.is_game_alive?(name))
  end

  # Create new game and add player A
  defp handle_join_resp(socket, game_id, player_name, size, false = _game_exists) do
    {:ok, game_id, _state} = DotSquare.start(game_id, size)
    add_player_resp = DotSquare.add_player(game_id, player_name)
    handle_add_player_resp(add_player_resp, game_id, :A, true, socket)
  end

  # Add player to the existing game
  defp handle_join_resp(socket, game_id, player_name, _size, true = _game_exists) do
    state = DotSquare.get_state(game_id)
    player_free = DotSquare.State.get_unset_player(state)

    case player_free do
      nil ->
        {:ok, %{state: state, new_game: false, error: "NO_SEAT"}, socket}

      player ->
        add_player_resp =  DotSquare.add_player(game_id, player_name)
        handle_add_player_resp(add_player_resp, game_id, player, false, socket)
    end
  end

  # TODO: Need to think and continue
  defp handle_add_player_resp({:ok, state}, game_id, player, new_game, socket) do
    socket = socket
        |> assign(:game_id, game_id)
        |> assign(:player, player)
    {:ok, %{state: state, player: player, new_game: new_game}, socket}
  end

  defp handle_add_player_resp({:error, state}, game_id, player, new_game, socket) do
    socket = socket
        |> assign(:game_id, game_id)
        |> assign(:player, player)
    {:ok, %{state: state, player: player, new_game: new_game, error: "ADD_PLAYER_FAILED"}, socket}
  end

  # def handle_in("dotsquare:add_player", %{"player_name" => player_name} = _params, socket) do
  #   game_id = socket.assigns.game_id
  #   state = DotSquare.add_player(game_id, :B, player_name)
  #   broadcast!(socket, "player_joined", %{state: state})
  #   {:noreply, socket}
  # end

  def handle_in("dotsquare:pub_state", _params, socket) do
    game_id = socket.assigns.game_id
    state = DotSquare.get_state(game_id)
    broadcast!(socket, "state", %{state: state})
    {:noreply, socket}
  end

  def handle_in(
        "dotsquare:mark_line",
        %{"start" => start_point, "end" => end_point} = _params,
        socket
      ) do
    game_id = socket.assigns.game_id
    {:ok, state} = DotSquare.add_vertex(game_id, start_point, end_point)
    broadcast!(socket, "line_marked", %{state: state, lastLine: {start_point, end_point}})
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
