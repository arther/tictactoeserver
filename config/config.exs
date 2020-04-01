# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :tictactoeserver,
  ecto_repos: [Tictactoeserver.Repo]

# Configures the endpoint
config :tictactoeserver, TictactoeserverWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "BrrhUuxznpqkLRNoXraPIvpaqIsxxzd1/F5BeuyZ0WbkU28tO9gwRg72+olKG1D3",
  render_errors: [view: TictactoeserverWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Tictactoeserver.PubSub, adapter: Phoenix.PubSub.PG2],
  live_view: [signing_salt: "EzOnTBSz"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
