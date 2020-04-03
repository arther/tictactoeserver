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
  end

  # Other scopes may use custom stacks.
  scope "/api", TictactoeserverWeb do
    pipe_through :api

    post "/mark-position", GameController, :mark_position
  end
end
