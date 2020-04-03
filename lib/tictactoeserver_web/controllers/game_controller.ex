defmodule TictactoeserverWeb.GameController do
  require Logger
  use TictactoeserverWeb, :controller
  alias Tictactoe.Game

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  def create(conn, %{"name" => name} = _param) do
    name = name |> String.to_atom()
    Game.start(name)
    render(conn, "index.html", name: name, state: Game.get_state(name).matrix)
  end

  def mark_position(conn, %{"name" => name, "position" => position} = _param) do
    name = name |> String.to_atom()
    Game.next_turn(name, String.to_integer(position)) |> game_over(conn, name)
  end

  defp game_over({false, _}, conn, name) do
    json(conn, %{ name: name, state: Game.get_state(name).matrix })
  end

  defp game_over({true, nil}, conn, name) do
    json(conn, %{ name: name, state: Game.get_state(name).matrix, result: "Game Tie"})
  end

  defp game_over({true, player}, conn, name) do
    json(conn,
      %{name: name,
      state: Game.get_state(name).matrix,
      result: "Player #{player} won"}
    )
  end
end
