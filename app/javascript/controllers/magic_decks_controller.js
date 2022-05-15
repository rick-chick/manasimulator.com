/**
 *
 */
function clickChartNavi(e) {
  const {category} = e.target.parentElement
    .parentElement.dataset;
  console.log(category);
  $("div[data-category='" + category + "'].chart").show()
  $("div[data-category='" + category + "'].discription").hide()
}

/**
 *
 */
function clickDiscriptionNavi(e) {
  const {category} = e.target.parentElement
    .parentElement.dataset;
  $("div[data-category='" + category + "'].chart").hide()
  $("div[data-category='" + category + "'].discription").show()
}


var ready = function() {
  $("a[data-chart-navi]").off().on("click", clickChartNavi);
  $("a[data-discription-navi]").off().on().click("click", clickDiscriptionNavi);
};

$(document).on("change", ready);
$(document).on('page:load', ready);
$(document).on('turbolinks:load', read);
