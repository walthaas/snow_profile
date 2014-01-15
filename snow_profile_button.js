/**
  @file Holds code to define a button object constructed from KineticJS shapes
  to get more control over the size and location of the button than we can
  get by using an HTML <button>button</button>.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
  @classdesc Define a button constructed from KineticJS shapes.
  @constructor
  @param {string} text - Text to appear inside the button.
  KineticJS stage.
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
    Define a rectangle around the text
    @type {Object}
    @private
   */
  var rect =  new Kinetic.Rect({
    x: SnowProfile.BUTTON_X,
    width: text.getWidth(),
    height: text.getHeight(),
    cornerRadius: 4,
    stroke: "#000",
    strokeWidth: 1,
    fill: "#fff"
  });

  /**
    Reposition the button on the Y axis
    @param {number} y - New vertical position of the center of the button
                        on the KineticJS stage.
   */
  function setY(y) {
    text.setY(y);
    text.setOffsetY((rect.getHeight() / 2) - 2);
    rect.setY(y);
    rect.setOffsetY(rect.getHeight() / 2);
    SnowProfile.stage.draw();
  }

  /**
    Destroy the button
   */
  function destroy() {
    text.off('click');
    text.destroy();
    rect.destroy();
    SnowProfile.stage.draw();
  }

  /**
   * Define the new object
   */
  var newObj = {
    destroy: destroy,
    setY: setY
  };

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", function(evt) {
    text.setVisible(false);
    rect.setVisible(false);
    SnowProfile.stage.draw();
  });

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", function(evt) {
    text.setVisible(true);
    rect.setVisible(true);
    SnowProfile.stage.draw();
  });

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
  SnowProfile.stage.draw();

  return newObj;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
