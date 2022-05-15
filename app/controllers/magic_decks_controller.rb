class MagicDecksController < ApplicationController
  before_action :set_magic_deck, only: %i[ show edit update destroy ]

  # GET /magic_decks or /magic_decks.json
  def index
    begin
      if flash[:id]
        @magic_deck = MagicDeck.find(flash[:id])
      end
      if @magic_deck  
        chart = simulate(@magic_deck)
        @played_over_drawed = chart[:played_over_drawed]
        @can_played_over_drawed = chart[:can_played_over_drawed]
        @played_over_sims = chart[:played_over_sims]
        @mana_curves = chart[:mana_curves]
        @magic_deck.delete
      else
        @magic_deck = MagicDeck.new
        @magic_deck.cards = t(:deck_sample)
        @magic_deck.turns = 10
        @magic_deck.simulations = 100
      end
    rescue => ex
      puts ex
      @magic_deck = MagicDeck.new
    end
  end

  def usage
  end

  def contact
  end

  # POST /magic_decks or /magic_decks.json
  def create
    @magic_deck = MagicDeck.new(magic_deck_params)
    respond_to do |format|
      if @magic_deck.save
        format.html { redirect_to magic_decks_url, flash: { id: @magic_deck.id }}
        format.json { render :show, status: :created, location: @magic_deck }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_magic_deck
      @magic_deck = MagicDeck.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def magic_deck_params
      params.require(:magic_deck).permit(:cards, :probabilities, :turns, :simulations)
    end

    def simulate(magic_deck)
      deck_string = magic_deck.cards
      deck, cards = Deck.create(deck_string.gsub(/(\\r\\n|\\r|\\n)/, "\n").split("\n"))
      return {} if not deck || cards.empty?
      config = SimulatorConfig.new
      config.deck =deck 
      config.turns = magic_deck.turns || 10
      config.simulations = magic_deck.simulations || 100
      simulator = Simulator.new(config)
      simulator.run
      sorted = [] 
      cards.each do |card|
        sorted << card
      end

      sorted.sort! {|a,b| a.converted_mana_cost <=> b.converted_mana_cost}

      played_over_drawed = {}
      played_over_sims = {}
      can_played_over_drawed = {}
      sorted.map do |card| 
        spell = card.contents.select {|c| c.types != "Land"}.first
        if spell
          mana_cost = spell.mana_cost
          name = "#{card.name.split('//')[0].chomp.strip} : #{mana_cost}"
          played, drawed, can_played, mana_sources = card.count
          a = played.to_f / config.simulations * 100
          b = played.to_f / drawed * 100
          c = can_played.to_f / drawed * 100
          played_over_sims[name] = a.round(1)
          played_over_drawed[name] = b.round(1)
          can_played_over_drawed[name] = c.round(1)
        end
      end

      mana_curves = {}
      sorted.map do |card|
        if card.mana_source?
          10.times do |i|
            turn = i + 1
            played, drawed, can_play, mana_sources = card.count(turn)
            card.color_identity.each do |c|
              mana_curves[c] ||= {}
              mana_curves[c][turn] ||= 0
              mana_curves[c][turn] += mana_sources[c].to_f / config.simulations
            end
          end
        end
      end
      mana_curves = mana_curves.keys.map do |c|
        {name: c, data:mana_curves[c]}
      end

      {
        played_over_drawed: played_over_drawed, 
        played_over_sims: played_over_sims, 
        can_played_over_drawed: can_played_over_drawed, 
        mana_curves: mana_curves
      }
    end
end
