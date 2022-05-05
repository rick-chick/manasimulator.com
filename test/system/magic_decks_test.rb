require "application_system_test_case"

class MagicDecksTest < ApplicationSystemTestCase
  setup do
    @magic_deck = magic_decks(:one)
  end

  test "visiting the index" do
    visit magic_decks_url
    assert_selector "h1", text: "Magic decks"
  end

  test "should create magic deck" do
    visit magic_decks_url
    click_on "New magic deck"

    fill_in "Cards", with: @magic_deck.cards
    fill_in "Probabilities", with: @magic_deck.probabilities
    click_on "Create Magic deck"

    assert_text "Magic deck was successfully created"
    click_on "Back"
  end

  test "should update Magic deck" do
    visit magic_deck_url(@magic_deck)
    click_on "Edit this magic deck", match: :first

    fill_in "Cards", with: @magic_deck.cards
    fill_in "Probabilities", with: @magic_deck.probabilities
    click_on "Update Magic deck"

    assert_text "Magic deck was successfully updated"
    click_on "Back"
  end

  test "should destroy Magic deck" do
    visit magic_deck_url(@magic_deck)
    click_on "Destroy this magic deck", match: :first

    assert_text "Magic deck was successfully destroyed"
  end
end
