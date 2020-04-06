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

    post "/create", GameController, :create

    get "/games/:name", GameController, :join_game

    get "/games/:name/restart", GameController, :restart_game

    get "/games/:name/close", GameController, :close_game

  end

  # Other scopes may use custom stacks.
  scope "/api", TictactoeserverWeb do
    pipe_through :api

    post "/mark-position", GameController, :mark_position

    get "/games/:name", GameController, :get_state

  end
end
