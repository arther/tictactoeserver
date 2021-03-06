defmodule TictactoeserverWeb.GameController do
  require Logger
  use TictactoeserverWeb, :controller

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  def tictactoe(conn, _params) do
    render(conn, "tictactoe.html")
  end

  def dot_square(conn, _params) do
    render(conn, "dot_square.html")
  end
end
