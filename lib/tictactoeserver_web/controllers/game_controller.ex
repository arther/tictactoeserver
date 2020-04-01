defmodule TictactoeserverWeb.GameController do
  require Logger
  use TictactoeserverWeb, :controller

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    render(conn, "index.html")
  end

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  def create(conn, %{"name" => name} = _param) do
    render(conn, "index.html", name: name)
  end
end
