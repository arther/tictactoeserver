defmodule TictactoeserverWeb.Router do
  use TictactoeserverWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", TictactoeserverWeb do
    pipe_through :browser

    get "/", GameController, :index
    get "/tictactoe", GameController, :tictactoe
    get "/dot-box", GameController, :dot_square

  end

  # Other scopes may use custom stacks.
  scope "/api", TictactoeserverWeb do
    pipe_through :api

  end
end
