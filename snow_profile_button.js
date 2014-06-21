/**
  @file Holds code to define a button object constructed from KineticJS shapes
  to get more control over the size and location of the button than we can
  get by using an HTML <button>button</button>.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
  @classdesc Define a button constructed from KineticJS shapes.
  @constructor
  @param {string} textArg - Text to appear inside the button.
  KineticJS stage.
  @listens SnowProfileHideControls
  @listens SnowProfileShowControls
  @fires SnowProfileButtonClick
*/
SnowProfile.Button = function(textArg) {

  "use strict";

  /**
    Define the text of the button
    @type {Object}
    @private
   */
  var text = new Kinetic.Text({
    x: SnowProfile.BUTTON_X,
    text: textArg,
    fontFamily: "sans-serif",
    fontSize: 12,
    padding: 4,
    stroke: "#000",
    strokeWidth: 1,
    align: "center"
  });

  /**
    Define a rectangle around the text.
    @type {Object}
    @private
   */
  var rect = new Kinetic.Rect({
    x: SnowProfile.BUTTON_X,
    width: text.getWidth(),
    height: text.getHeight(),
    cornerRadius: 4,
    stroke: "#000",
    strokeWidth: 1,
    fill: "#fff"
  });

  /**
   * Hide this button.
   * @private
   */
  function hideButton() {
    text.setVisible(false);
    rect.setVisible(false);
    SnowProfile.kineticJSLayer.draw();
  }

  /**
   * Show this button.
   * @private
   */
  function showButton() {
    text.setVisible(true);
    rect.setVisible(true);
    SnowProfile.kineticJSLayer.draw();
  }

  /**
   * Reposition the button on the Y axis
   * @param {number} y - New vertical position of the center of the button
   *                     on the KineticJS stage.
   * @public
   */
  function setY(y) {
    text.setY(y);
    text.setOffsetY(rect.getHeight() / 2);
    rect.setY(y);
    rect.setOffsetY(rect.getHeight() / 2);
    SnowProfile.kineticJSLayer.draw();
  }

  /**
   * Destroy the button
   * @public
   */
  function destroy() {
    text.off('click');
    $(document).unbind("SnowProfileHideControls", hideButton);
    $(document).unbind("SnowProfileShowControls", showButton);
    text.destroy();
    rect.destroy();
    SnowProfile.kineticJSLayer.draw();
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
  text.on('click', function(evt) {
    $.event.trigger("SnowProfileButtonClick", {buttonObj: newObj});
  });

  // Set the X position of the button and add it to the KineticJS stage.
  rect.setOffsetX(rect.getWidth() / 2);
  text.setOffsetX(rect.getWidth() / 2);
  SnowProfile.kineticJSLayer.add(rect);
  SnowProfile.kineticJSLayer.add(text);
  SnowProfile.kineticJSLayer.draw();

  return newObj;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
