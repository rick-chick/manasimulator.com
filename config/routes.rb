Rails.application.routes.draw do
  root to: 'magic_decks#index'
  get 'magic_decks', to: "magic_decks#index"
  post 'magic_decks', to: "magic_decks#create"

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
