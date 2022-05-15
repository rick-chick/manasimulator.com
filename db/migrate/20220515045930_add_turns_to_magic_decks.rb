class AddTurnsToMagicDecks < ActiveRecord::Migration[7.0]
  def change
    add_column :magic_decks, :turns, :integer
  end
end
