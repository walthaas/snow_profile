/**
 * @file Holds code to define a button object constructed from SVG shapes
 * to get more control over the size and location of the button than we can
 * get by using an HTML <button>button</button>.
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
 * @classdesc Define a button constructed from SVG shapes.
 * @constructor
 * @param {string} textArg - Text to appear inside the button.
 * @listens SnowProfileHideControls
 * @listens SnowProfileShowControls
 * @fires SnowProfileButtonClick
*/
SnowProfile.Button = function(textArg) {

  "use strict";
  /**
   * Group holding button text and rectangle around it
   * @type {Object}
   * @private
   */
  var buttonGroup = SnowProfile.drawing.group();

  /**
   * Define the text of the button
   * @type {Object}
   * @private
   */
  var text = SnowProfile.drawing.text(textArg)
    .font({
      family: "sans-serif",
      size: 12,
      fill: "#000",
      stroke: 1
    })
    .cx(SnowProfile.BUTTON_X);
  buttonGroup.add(text);

  // Draw a rectangle around the text
  var button = SnowProfile.drawing.rect(text.bbox().width + 4,
    text.bbox().height + 4)
    .cx(SnowProfile.BUTTON_X)
    .style({
      "stroke-width": 1,
      stroke: "#000",
      "stroke-opacity": 1,
      fill: "#fff",
      "fill-opacity": 0
    })
    .radius(4);
  buttonGroup.add(button);

  /**
   * Hide this button.
   * @private
   */
  function hideButton() {
    buttonGroup.hide();
  }

  /**
   * Show this button.
   * @private
   */
  function showButton() {
    buttonGroup.show();
  }

  /**
   * Reposition the button on the Y axis
   * @param {number} y - New vertical position of the center of the button
   * @public
   */
  function setY(y) {
    buttonGroup.cy(y);
  }

  /**
   * Destroy the button
   * @public
   */
  function destroy() {
    button.off('click');
    $(document).unbind("SnowProfileHideControls", hideButton);
    $(document).unbind("SnowProfileShowControls", showButton);
    buttonGroup.remove();
  }

  /**
   * Define the new object
   */
  var newObj = {
    destroy: destroy,
    setY: setY
  };

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", hideButton);

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", showButton);

  // Listen for mouse clicks on this button, then emit a custom event
  // which identifies which button was clicked.
  button.click(function(evt) {
    $.event.trigger("SnowProfileButtonClick", {buttonObj: newObj});
  });

  return newObj;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
