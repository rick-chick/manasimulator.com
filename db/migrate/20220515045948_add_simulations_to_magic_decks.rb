class AddSimulationsToMagicDecks < ActiveRecord::Migration[7.0]
  def change
    add_column :magic_decks, :simulations, :integer
  end
end
