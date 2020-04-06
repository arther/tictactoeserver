defmodule TictactoeserverWeb.GameController do
  require Logger
  use TictactoeserverWeb, :controller
  alias Tictactoe.Game

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  def join_game(conn, %{"name" => name} = _param) do
    name = name |> String.to_atom
    Game.add_player(name)
    render(conn, "index.html", name: name, state: Game.get_state(name).matrix)
  end

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  def create(conn, %{"name" => name} = _param) do
    name = name |> String.to_atom()
    Game.start(name)
    redirect(conn, to: "/games/#{name}")
  end

  # APIs
  def get_state(conn,  %{"name" => name} = _param) do
    name = name |> String.to_atom
    state_response(conn, name, Game.is_game_alive?(name))
  end

  defp state_response(conn, name, true = _is_alive) do
    json(conn, %{name: name, state: Game.get_state(name).matrix })
  end

  defp state_response(conn, name, false = _is_alive) do
    json(conn, %{name: name, error: "Game is no more alive" })
  end

  def mark_position(conn, %{"name" => name, "position" => position} = _param) do
    name = name |> String.to_atom()
    Game.next_turn(name, String.to_integer(position)) |> game_over?(conn, name)
  end

  defp game_over?({false, _}, conn, name) do
    json(conn, %{ name: name, state: Game.get_state(name).matrix })
  end

  defp game_over?({true, nil}, conn, name) do
    json(conn, %{ name: name, state: Game.get_state(name).matrix, tie: true})
  end

  defp game_over?({true, player}, conn, name) do
    json(conn,
      %{name: name,
      state: Game.get_state(name).matrix,
      result: player}
    )
  end

  def close_game(conn, %{"name" => name} = _param) do
    name = name |> String.to_atom()
    status = Game.kill_game(name)
    redirect(conn, to: "/")
  end

  def restart_game(conn, %{"name" => name} = _param) do
    name = name |> String.to_atom()
    status = Game.kill_game(name)
    Game.start(name)
    redirect(conn, to: "/games/#{name}")
  end
end
