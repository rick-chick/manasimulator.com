import { Controller } from "@hotwired/stimulus";
import $ from 'jquery';


export default class extends Controller {

  static targets = ['deck', 'numcards']
  ctrlDown = false
  ctrlKey = 17
  cmdKey = 91
  vKey = 86

  connect(e) {
    this.deckChange(e);
  }

  deckChange(e) {
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

  paste(e) {
    var _self = this;
    if ($('.paste-deck').text() == 'sync') 
      return;

    navigator.clipboard.read().then(
      items => {
        var blobimg = null;
        for(var i = 0; i < items.length; i ++ ) {
          var clipboardItem = items[i];
          for (var j = 0; j < clipboardItem.types.length; j++) {
            var type = clipboardItem.types[j];
            if (type.indexOf("image") >= 0) {
              $('.paste-deck').text('sync');
              clipboardItem.getType(type).then(
                blobimg => {
                  if( blobimg == null ){
                    $('.paste-deck').text('content_paste_go');
                    return;
                  }

                  var bloburl = URL.createObjectURL( blobimg );

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
                      })
                      .fail(function() {
                        alert("error!");
                      })
                      .always(function() {
                        $('.paste-deck').text('content_paste_go');
                      });
                  };
                  image.src = bloburl;
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

}
