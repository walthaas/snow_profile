/**
  @file File to hold the modal dialog object to describe a snow layer
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
  Object for a jQueryUI modal dialog to enter data describing a snow layer.
  @constructor
 */
SnowProfile.PopUp = function(data) {
  "use strict";

  var self = this;

  // Fill in the pop-up HTML form with information passed to constructor
  $("#snow_profile_grain_shape").val(data.grainShape);
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

        // Delete this layer
        data.layer.delete();

        // Close the popup
        $(this).dialog("close");
      }
    });
  }
  $("#snow_profile_descr").dialog(editArgs);
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
