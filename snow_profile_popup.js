/**
  @file File to hold the modal dialog object to describe a snow layer
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

// Populate the selects from the CAAML tables
(function() {
  "use strict";

    var code;

    // Populate the grain shape selector in the layer description pop-up
    for (code in SnowProfile.CAAML_SHAPE) {
      if (SnowProfile.CAAML_SHAPE.hasOwnProperty(code)) {
        $("#snow_profile_grain_shape").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_SHAPE[code].text + "</option>");
      }
    }

    // Create the <select>s for the grain subshape from the CAAML_SUBSHAPE
    // table.
    var html = "";
    for (var shape in SnowProfile.CAAML_SUBSHAPE) {
      if (SnowProfile.CAAML_SUBSHAPE.hasOwnProperty(shape)) {
        html += "<select id=\"snow_profile_grain_subshape_" + shape +
          "\" style=\"display: none\">";
        html += "<option value=\"\" selected=\"selected\"></option>";
        for (var subShape in SnowProfile.CAAML_SUBSHAPE[shape]) {
          if (SnowProfile.CAAML_SUBSHAPE[shape].hasOwnProperty(subShape)) {
            html += "<option value=\"" + subShape + "\">" +
            SnowProfile.CAAML_SUBSHAPE[shape][subShape] + "</option>";
          }
        }
        html += "</select>";
      }
    }
    $("#snow_profile_grain_subshape").append(html);

    // Populate the grain size selector in the layer description pop-up
    for (code in SnowProfile.CAAML_SIZE) {
      if (SnowProfile.CAAML_SIZE.hasOwnProperty(code)) {
        $("#snow_profile_grain_size").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_SIZE[code] + "</option>");
      }
    }

    // Populate the liquid water selector in the layer description pop-up
    for (code in SnowProfile.CAAML_LWC) {
      if (SnowProfile.CAAML_LWC.hasOwnProperty(code)) {
        $("#snow_profile_lwc").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_LWC[code] + "</option>");
      }
    }
})();

/**
  Object for a jQueryUI modal dialog to enter data describing a snow layer.
  @constructor
 */
SnowProfile.PopUp = function(data) {
  "use strict";

  // Fill in the pop-up HTML form with information passed to constructor
  $("#snow_profile_grain_shape").val(data.grainShape);
  $("#snow_profile_grain_subshape option").attr("selected", false);
  $("#snow_profile_grain_subshape").val(data.grainSubShape);
  $("#snow_profile_grain_size").val(data.grainSize);
  $("#snow_profile_lwc").val(data.lwc);
  $("#snow_profile_comment").val(data.comment);
  var editArgs = {
    modal: true,
    width: 400,
    height: 600,
    buttons: [
      {
        // Done button on description pop-up saves values from
        // the pop-up form into the layer description
        text: "Done",
        click: function() {

          // Store description in layer
          data.layer.describe({
            grainShape: $("#snow_profile_grain_shape").val(),
            grainSubShape: $("#snow_profile_grain_subshape_" +
              $("#snow_profile_grain_shape").val()).val(),
            grainSize: $("#snow_profile_grain_size").val(),
            lwc: $("#snow_profile_lwc").val(),
            comment: $("#snow_profile_comment").val()
          });

          // Close the popup
          $(this).dialog("close");
        }
      },
      {
        // Cancel button on description pop-up throws away changes
        text: "Cancel",
        tabindex: -1,
        click: function() {$(this).dialog("close");}
      }
    ]
  };
  if (data.numLayers > 1) {

    // If there is more than one layer, add a "Delete" button to the pop-up
    editArgs.buttons.push({
      text: "Delete",
      tabindex: -1,
      click: function() {

        // Not reversible so ask for confirmation
        if (confirm("This action cannot be reversed.  Delete?")) {

          // Delete this layer
          data.layer.deleteLayer();
        }

        // Close the popup
        $(this).dialog("close");
      }
    });
  }
  $("#snow_profile_descr").dialog(editArgs);

  // Listen for changes to the grain shape
  $("#snow_profile_grain_shape").change(function() {

    // Grain shape selection has changed, so adjust sub-shape <select>.
    $("#snow_profile_grain_subshape select").attr("style", "display:none;");
    $("#snow_profile_grain_subshape option").attr("selected", false);
    $("#snow_profile_grain_subshape option[value='']").attr("selected", true);
    if ($("#snow_profile_grain_shape").val()) {

      // A non-null grain shape has been selected.  Display the sub-shape
      $("#snow_profile_grain_subshape_" +
        $("#snow_profile_grain_shape").val()).attr("style", "display:block;");
    }
  });
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
