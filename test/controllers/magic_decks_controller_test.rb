require "test_helper"

class MagicDecksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @magic_deck = magic_decks(:one)
  end

  test "should get index" do
    get magic_decks_url
    assert_response :success
  end

  test "should get new" do
    get new_magic_deck_url
    assert_response :success
  end

  test "should create magic_deck" do
    assert_difference("MagicDeck.count") do
      post magic_decks_url, params: { magic_deck: { cards: @magic_deck.cards, probabilities: @magic_deck.probabilities } }
    end

    assert_redirected_to magic_deck_url(MagicDeck.last)
  end

  test "should show magic_deck" do
    get magic_deck_url(@magic_deck)
    assert_response :success
  end

  test "should get edit" do
    get edit_magic_deck_url(@magic_deck)
    assert_response :success
  end

  test "should update magic_deck" do
    patch magic_deck_url(@magic_deck), params: { magic_deck: { cards: @magic_deck.cards, probabilities: @magic_deck.probabilities } }
    assert_redirected_to magic_deck_url(@magic_deck)
  end

  test "should destroy magic_deck" do
    assert_difference("MagicDeck.count", -1) do
      delete magic_deck_url(@magic_deck)
    end

    assert_redirected_to magic_decks_url
  end
end
