defmodule Tictactoeserver.Repo do
  use Ecto.Repo,
    otp_app: :tictactoeserver,
    adapter: Ecto.Adapters.Postgres
end
