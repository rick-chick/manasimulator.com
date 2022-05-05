class CreateMagicDecks < ActiveRecord::Migration[7.0]
  def change
    create_table :magic_decks do |t|
      t.string :cards
      t.string :probabilities

      t.timestamps
    end
  end
end
