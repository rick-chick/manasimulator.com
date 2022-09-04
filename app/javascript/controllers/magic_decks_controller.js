import { Controller } from "@hotwired/stimulus";
import $ from 'jquery';


export default class extends Controller {

  static targets = [
    // cards input area
    'deck', 
    // cards size
    'numcards', 
    // legality selected at select box
    'legality', 
    // card details includes legalities 
    'details', 
    // cards input area changed after card details scraped
    'deckChangedFlg']
  ctrlDown = false
  ctrlKey = 17
  cmdKey = 91
  vKey = 86

  connect(e) {
    this.deckChange(e);
  }

  deckChange(e) {
    this.deckChangedFlgTarget.value = true;
    var deck = this.deckTarget.value;
    if (!deck) {
      return;
    }
    var lines = deck.split("\n");
    var cards = 0;
    for (var i = 0; i < lines.length; i ++ ) {
      var line = lines[i];
      if (line == "") {
        break;
      }
      var columns = line.split(" ");
      if (columns[0] != "" && isFinite(columns[0])) {
        cards += parseInt(columns[0]);
      }
    }
    var label = this.numcardsTarget.innerText;
    label = label.split("\n")[0];
    this.numcardsTarget.innerText = label + "\n" + cards;
  }

  takePicture(e) {
    var _self = this;
    $("#upload").click();
  }

  changePicture(e) {
    if (this.isCommanding()) 
      return;
    console.log(e);
    var bloburl = URL.createObjectURL( e.target.files[0] );
    this.uploadImage(bloburl, this);
  }

  paste(e) {
    var _self = this;
    if (this.isCommanding()) 
      return;

    navigator.clipboard.read().then(
      items => {
        var blobimg = null;
        for(var i = 0; i < items.length; i ++ ) {
          var clipboardItem = items[i];
          for (var j = 0; j < clipboardItem.types.length; j++) {
            var type = clipboardItem.types[j];
            if (type.indexOf("image") >= 0) {
              clipboardItem.getType(type).then(
                blobimg => {
                  if( blobimg == null ){
                    $('.paste-deck').text('content_paste_go');
                    return;
                  }

                  var bloburl = URL.createObjectURL( blobimg );
                  this.uploadImage(bloburl, _self);
                }
              )
            } else if (type.indexOf("text") >=0 ) {
              clipboardItem.getType(type).then(
                blob => {
                  blob.text().then(
                    text => {
                      _self.deckTarget.value = text;
                    }
                  )
                }
              )
            }
          }
        }

      }
    )
  }

  legalityChange(e) {
    var _self = this;
    var deck = this.deckTarget.value;
    var legality = this.legalityTarget.value;
    var details = this.detailsTarget.value; 
    if (!deck || !legality) {
      return;
    }
    if (legality == "Select") {
      return;
    }
    var updateLegalities = function(data) {
      $('.legalities div').remove();
      console.log(data);

      var panel = $('.legalities')[0];
      panel.style.display =  'flex';
      panel.style.flexDirection = 'column';
      panel.style.width = '100%';
      panel.style.paddingTop = "15px";

      for (var i = 0; i < data.details.length; i++) {
        var card = data.details[i];

        var rowDiv = $('<div>');
        var nameDiv = $('<div>');
        var lnkDiv = $('<a>');
        var legalityDiv = $('<div>');

        lnkDiv[0].href = 'https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' + card.multiverseid;
        lnkDiv[0].target = "_blank";
        lnkDiv.text(card.name);

        nameDiv[0].appendChild(lnkDiv[0]);

        legalityDiv.text(card.legalities[legality].name);

        rowDiv[0].style.display = "flex"
        rowDiv[0].style.flexDirection = "row";
        rowDiv[0].style.justifyContent = "space-between";

        rowDiv[0].appendChild(nameDiv[0]);
        rowDiv[0].appendChild(legalityDiv[0]);

        panel.appendChild(rowDiv[0]);
        _self.deckChangedFlgTarget.value = false;
      }
    };

    if (!details || _self.deckChangedFlgTarget.value == "true") {
      $('.legalities div').remove();
      var div = $("<div>")[0];
      div.classList.add("loader");
      $('.legalities')[0].appendChild(div);
      var json = {
        "magic_deck": {
          "cards": deck
        }
      };
      let url = '/magic_decks/legalities';
      $.ajax({
        url: url,
        headers: {
          'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        data: json,
        dataType: "json"
      })
        .done(function(data) {
          _self.detailsTarget.value = JSON.stringify(data);
          updateLegalities(data);
        })
        .fail(function() {
          alert("error!");
        })
        .always(function() {
        });
    } else {
      updateLegalities(JSON.parse(_self.detailsTarget.value));
    };
  }

  uploadImage = function(bloburl, _self) {
    _self.hideCommandIcons();
    var image = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    image.onload = function() {
      var sw = image.naturalWidth;
      var sh = image.naturalHeight;
      var dw = image.naturalWidth;
      var dh = image.naturalHeight;
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage( image, 0, 0, sw, sh, 0, 0, dw, dh );
      var base64 = canvas.toDataURL('image/jpeg', 0.7)
      var json = {}
      json['base64'] = base64;

      let url = '/magic_decks/image';
      $.ajax({
        url: url,
        headers: {
          'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
        },
        type: "POST",
        data: json,
        dataType: "json"
      })
        .done(function(data) {
          _self.deckTarget.value = data["deck"];
          _self.deckChangedFlgTarget.value = true;
        })
        .fail(function() {
          alert("error!");
        })
        .always(function() {
          _self.showCommandIcons();
        });
    };
    image.src = bloburl;
  }

  showCommandIcons = function() {
    $('.paste-deck').css('display', 'block');
    $('.take-picture').css('display', 'block');
    $('.sync').css('display', 'none');

    $('#simulate').prop('disabled', false);
    $('#legality').prop('disabled', false);
  }

  hideCommandIcons = function() {
    $('.paste-deck').css('display', 'none');
    $('.take-picture').css('display', 'none');
    $('.sync').css('display', 'block');

    $('#simulate').prop('disabled', true);
    $('#legality').prop('disabled', true);
  }

  isCommanding = function() {
    return $('.sync').css('display') == 'block';
  }
}
