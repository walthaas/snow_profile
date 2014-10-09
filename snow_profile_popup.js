/**
  @file File to hold the modal dialog object to describe a snow layer
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
 * Populate the selects from the CAAML tables
 * @function
 */
(function() {

  "use strict";

  var code;

  // Populate the grain shape selects in the layer description pop-up
  for (code in SnowProfile.CAAML_SHAPE) {
    if (SnowProfile.CAAML_SHAPE.hasOwnProperty(code)) {
      $("#snow_profile_primary_grain_shape").append("<option value=\"" +
        code + "\">" + SnowProfile.CAAML_SHAPE[code].text + "</option>");
      $("#snow_profile_secondary_grain_select").append("<option value=\"" +
        code + "\">" + SnowProfile.CAAML_SHAPE[code].text + "</option>");
    }
  }

  // Create the <select>s for the grain subshape from the CAAML_SUBSHAPE
  // table.
  var primary_opts = "",
    secondary_opts = "";
  for (var shape in SnowProfile.CAAML_SUBSHAPE) {
    if (SnowProfile.CAAML_SUBSHAPE.hasOwnProperty(shape)) {
      primary_opts += "<select id=\"snow_profile_primary_grain_subshape_" +
        shape + "\" style=\"display: none\"><option value=\"\"" +
        " selected=\"selected\"></option>";
      secondary_opts +=
        "<select id=\"snow_profile_secondary_grain_subshape_" +
        shape + "\" style=\"display: none\"><option value=\"\"" +
        " selected=\"selected\"></option>";
      for (var subShape in SnowProfile.CAAML_SUBSHAPE[shape]) {
        if (SnowProfile.CAAML_SUBSHAPE[shape].hasOwnProperty(subShape)) {
          primary_opts += "<option value=\"" + subShape + "\">" +
            SnowProfile.CAAML_SUBSHAPE[shape][subShape].text + "</option>";
          secondary_opts += "<option value=\"" + subShape + "\">" +
            SnowProfile.CAAML_SUBSHAPE[shape][subShape].text + "</option>";
        }
      }
      primary_opts += "</select>";
      secondary_opts += "</select>";
    }
  }
  $("#snow_profile_primary_grain_subshape").append(primary_opts);
  $("#snow_profile_secondary_grain_subshape").append(secondary_opts);

  // Populate the grain size selector in the layer description pop-up
  for (code in SnowProfile.CAAML_SIZE) {
    if (SnowProfile.CAAML_SIZE.hasOwnProperty(code)) {
      $("#snow_profile_grain_size").append("<option value=\"" + code +
        "\">" + SnowProfile.CAAML_SIZE[code] + "</option>");
    }
  }
})();

/**
  Object for a jQueryUI modal dialog to enter data describing a snow layer.
  @constructor
  @todo Document data parameter
 */
SnowProfile.PopUp = function(data) {
  "use strict";

  // Fill in the pop-up HTML form with information passed to constructor
  $("#snow_profile_primary_grain_shape option").attr("selected", false);
  $("#snow_profile_primary_grain_shape option[value=" +
    data.primaryGrainShape + "]").attr("selected", true);
  $("#snow_profile_primary_grain_subshape select").css("display", "none");
  $("#snow_profile_primary_grain_subshape_" + data.primaryGrainShape).
    css("display", "block");
  $("#snow_profile_primary_grain_subshape option").attr("selected", false);
  $("#snow_profile_primary_grain_subshape option[value=" +
    data.primaryGrainSubShape + "]").attr("selected", true);
  $("#snow_profile_secondary_grain_subshape select").css("display", "none");
  $("#snow_profile_secondary_grain_select option").attr("selected", false);
  $("#snow_profile_secondary_grain_select option[value=" +
    data.secondaryGrainShape + "]").attr("selected", true);
  $("#snow_profile_secondary_grain_subshape select").css("display", "none");
  $("#snow_profile_secondary_grain_subshape_" + data.secondaryGrainShape).
    css("display", "block");
  $("#snow_profile_secondary_grain_subshape option").attr("selected", false);
  $("#snow_profile_secondary_grain_subshape option[value=" +
    data.secondaryGrainSubShape + "]").attr("selected", true);
  $("#snow_profile_grain_size").val(data.grainSize);
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
            primaryGrainShape: $("#snow_profile_primary_grain_shape").val(),
            primaryGrainSubShape: $("#snow_profile_primary_grain_subshape_" +
              $("#snow_profile_primary_grain_shape").val()).val(),
            secondaryGrainShape: $("#snow_profile_secondary_grain_select").val(),
            secondaryGrainSubShape: $(
              "#snow_profile_secondary_grain_subshape_" +
              $("#snow_profile_secondary_grain_select").val()).val(),
            grainSize: $("#snow_profile_grain_size").val(),
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
  $("#snow_profile_popup").dialog(editArgs);

  // Listen for changes to the primary grain shape
  $("#snow_profile_primary_grain_shape").change(function() {

    // Primary grain shape selection has changed, so adjust sub-shape <select>
    // and re-initialize secondary shape.
    $("#snow_profile_primary_grain_subshape select").attr(
      "style", "display:none;");
    $("#snow_profile_primary_grain_subshape option").attr("selected", false);
    $("#snow_profile_primary_grain_subshape option[value='']").attr(
      "selected", true);
    $("#snow_profile_secondary_grain_shape")
      .attr("style", "display:none;");
    $("#snow_profile_secondary_grain_select option").attr("selected", false);
    $("#snow_profile_secondary_grain_select option[value='']").attr(
      "selected", true);
    $("#snow_profile_secondary_grain_subshape select").attr(
      "style", "display:none;");
    $("#snow_profile_secondary_grain_subshape option").attr("selected", false);
    $("#snow_profile_secondary_grain_subshape option[value='']").attr(
      "selected", true);
    if ($("#snow_profile_primary_grain_shape").val()) {

      // A non-null primary grain shape has been selected.
      // Display the primary sub-shape.
      $("#snow_profile_primary_grain_subshape_" +
        $("#snow_profile_primary_grain_shape").val()).attr(
       "style", "display:block;");
      $("#snow_profile_secondary_grain_shape")
        .attr("style", "display:block;");
    }
  });

  // Listen for changes to the secondary grain shape
  $("#snow_profile_secondary_grain_select").change(function() {

    // Secondary grain shape selection has changed, so adjust
    // secondary sub-shape <select>.
    $("#snow_profile_secondary_grain_subshape select").attr(
      "style", "display:none;");
    $("#snow_profile_secondary_grain_subshape option").attr("selected", false);
    $("#snow_profile_secondary_grain_subshape option[value='']").attr(
      "selected", true);
    if ($("#snow_profile_secondary_grain_select").val()) {

      // A non-null secondary grain shape has been selected.
      // Display the secondary sub-shape.
      $("#snow_profile_secondary_grain_subshape_" +
        $("#snow_profile_secondary_grain_select").val()).attr(
       "style", "display:block;");
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
