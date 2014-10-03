/**
 * @file Define the object that describes a snow layer
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
 * Object describing a single snow stratigraphy layer.
 * @param {number} depthArg Initial depth in cm of this layer from the top
 * of the snow pack.
 * @constructor
 * @listens SnowProfileAdjustGrid
 * @listens SnowProfileButtonClick
 * @listens SnowProfileHideControls
 * @listens SnowProfileShowControls
 */
SnowProfile.Layer = function(depthArg) {
  "use strict";

  // Reference this object inside an event handler
  var self = this;

  /**
   * Depth of the top of this snow layer in cm from the snow surface.
   *
   * Initialized to the argument passed to the constructor and adjusted
   * whenever the user moves the handle for this snow layer.
   * @type {number}
   */
  var depthVal = depthArg;

  /**
   * Grain shape of this layer.
   *
   * Two- or four-character code from the
   * [IACS 2009 Standard]{@link http://www.cryosphericsciences.org/products/snowClassification/snowclass_2009-11-23-tagged-highres.pdf}
   * Appendix A.1 table as stored in {@link SnowProfile.CAAML_SHAPE} or
   * {@link SnowProfile.CAAML_SUBSHAPE}.
   * @type {string}
   */
  var primaryGrainShape = "";
  var primaryGrainSubShape = "";
  var secondaryGrainShape = "";
  var secondaryGrainSubShape = "";

  /**
   * Grain size of this snow layer.
   *
   * Code from the
   * [CAAMLv5 IACS Snow Profile schema definition]{@link http://caaml.org/Schemas/V5.0/Profiles/SnowProfileIACS/CAAMLv5_SnowProfileIACS.xsd}
   * GrainSizeBaseEnumType as stored in {@link SnowProfile.CAAML_SIZE}.
   * @type {string}
   */
  var grainSize = "";

  /**
   * User's comment about this snow layer
   *
   * The comment character string entered by the user to comment
   * on this snow layer.
   * @type {string}
   */
  var comment = "";

  var layerDescr = SnowProfile.drawing.group(SnowProfile.Cfg.LAYER_DESCR_WD,
    SnowProfile.Cfg.DESCR_HEIGHT)
    .addClass('snow_profile_layer_descr')
    .x(SnowProfile.Cfg.LAYER_DESCR_LEFT)
    .y(SnowProfile.depth2y(depthVal) + (SnowProfile.Cfg.HANDLE_SIZE / 2));

  // For debugging, show the bounding box
  var ldBox = SnowProfile.drawing.rect(0, 0)
    .addClass('snow_profile_ldbox')
    .style({
       "fill-opacity": 0,
       stroke: 'blue'
    });
  layerDescr.add(ldBox);

  /**
   * Text for the comment.
   *
   * [SVG.Text]{@link http://documentup.com/wout/svg.js#text/text}
   * object for text describing the user's comment on this snow layer.  It
   * contains the character string entered by the user from
   * {@link SnowProfile.Layer~comment} plus additional
   * information to format this string on the browser window.
   * @type {Object}
   * @todo Figure out how to manage width
   */
  var commentDescr = layerDescr.text("")
  .addClass('snow_profile_comment_descr')
  .font({
    size: 14,
    family: 'sans-serif',
    fill: "#000",
  })
  .x(SnowProfile.Cfg.COMMENT_LEFT);

  // For debugging, show the bounding box
  var cdBox = SnowProfile.drawing.rect(0, 0)
    .addClass('snow_profile_cdbox')
    .style({
       "fill-opacity": 0,
       stroke: 'red'
    });
  layerDescr.add(cdBox);

  /**
   * Has the user touched the handle since this layer was created?
   *
   * Used to make an untouched handle throb visibly, to draw the user's
   * attention to the need to set the handle position.
   * @type {boolean}
   */
  var handleTouched = false;

  /**
   * Hardness of this snow layer.
   *
   * A string code from the {@link SnowProfile.CAAML_HARD} table.
   * The initial value of null indicates the handle for this snow layer has not
   * yet been touched by the user.
   * @type {string}
   */
  var hardness = null;

  /**
   * Text for the grain size
   *
   * [SVG.Text]{@link http://documentup.com/wout/svg.js#text/text}
   * object for text giving the grain size of this snow layer.
   * @type {Object}
   */
  var grainSizeText = layerDescr.text("")
  .addClass('snow_profile_grain_size')
  .font({
    size: 14,
    family: 'sans-serif',
    fill: "#000"
  })
  .x(SnowProfile.Cfg.GRAIN_SIZE_LEFT);

  // For debugging, show the bounding box
  var gsBox = SnowProfile.drawing.rect(0, 0)
    .addClass('snow_profile_gsbox')
    .style({
       "fill-opacity": 0,
       stroke: 'red'
    });
  layerDescr.add(gsBox);

  /**
   * Group to hold the icons describing this layer's grains
   *
   * [SVG.G]{@link http://documentup.com/wout/svg.js#parent-elements/groups}
   * object holding icons describing the grain shape of this snow layer.
   * @type {Object}
   */
  var grainIcons = layerDescr.group()
    .addClass('snow_profile_grain_icons')
    .x(SnowProfile.Cfg.GRAIN_ICON_LEFT);

  // For debugging, show the bounding box
  var giBox = SnowProfile.drawing.rect(0, 0)
    .addClass('snow_profile_gibox')
    .style({
       "fill-opacity": 0,
       stroke: 'red'
    });
  layerDescr.add(giBox);

  /**
   * Horizontal line below the description
   *
   * [SVG.Line]{@link http://documentup.com/wout/svg.js#line}
   * object for a horizontal line below the text description of this snow
   * layer.  This line visually separates the descriptions of the various
   * snow layers.
   * @type {Object}
   */
  var lineBelow = layerDescr.line(0, 0, 0, 0)
    .addClass('snow_profile_line_below')
    .stroke({
      color: SnowProfile.Cfg.GRID_COLOR,
      width: 1
    });

  /**
   * Handle for the line at the top of the layer.
   *
   * The user drags and drops this handle to adjust depth and hardness.
   * @type {Object}
   */
  var handle = SnowProfile.drawing.rect(SnowProfile.Cfg.HANDLE_SIZE,
    SnowProfile.Cfg.HANDLE_SIZE)
    .x(SnowProfile.Cfg.HANDLE_INIT_X)
    .addClass("snow_profile_handle");

  /**
   * Process handle drag
   *
   * @callback
   * @method
   * @memberof handle
   * @param integer x X-axis position of upper-left corner of handle
   * @param integer y Y-axis position of upper-left corner of handle
   * @returns Object New position of handle
   *   + x: new X-axis position of upper-left corner of handle
   *   + y: new Y-axis position of upper-left corner of handle
   */
  handle.draggable(function(x, y) {
    var newX = x;
    var newY = y;
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    var mm;

    // Stop the animation
    handle.stop();
    handle.size(SnowProfile.Cfg.HANDLE_SIZE, SnowProfile.Cfg.HANDLE_SIZE);

    // X (hardness) position is bound by the edges of the graph.
    if (x < SnowProfile.Cfg.HANDLE_MIN_X) {
      newX = SnowProfile.Cfg.HANDLE_MIN_X;
    }
    else if (x > SnowProfile.Cfg.HANDLE_MAX_X) {
      newX = SnowProfile.Cfg.HANDLE_MAX_X;
    }

    // Y (depth) position is limited by the depth of the snow layers
    // above and below in the snow pack, or by air and ground.
    if (i === 0) {

      // This is the top (snow surface) layer.
      // Handle stays on the surface.
      newY = SnowProfile.Cfg.HANDLE_MIN_Y;
    }
    else if (i === (numLayers - 1)) {

      // This is the bottom layer.  The handle depth is constrained
      // between the layer above and GRAPH_HEIGHT.
      if (y > (SnowProfile.handleMaxY)) {
        newY = SnowProfile.handleMaxY;
      }
      else if (y < SnowProfile.snowLayers[i - 1].handleGetY()) {
        newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
      }
    }
    else {

      // This layer is below the surface and above the bottom.
      // The handle depth is constrained between layers above and below.
      if (y > SnowProfile.snowLayers[i + 1].handleGetY()) {
        newY = SnowProfile.snowLayers[i + 1].handleGetY() - 1;
      }
      else if (y < SnowProfile.snowLayers[i - 1].handleGetY()) {
        newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
      }
    }

    // Adjust the horizontal (hardness) position
    hardness = self.x2code(newX);

    // Adjust the vertical (depth) position
    depthVal = self.y2depth(newY);

    // Draw the outline rectangle
    self.setLayerOutline();

    // Set the text information floating to the right of the graph
    if (SnowProfile.depthRef === "s") {

       // Depth is referred to the snow surface
       mm = Math.round(depthVal * 10) / 10;
    }
    else {

      // Depth is referred to the ground
      mm = Math.round((SnowProfile.totalDepth - depthVal) * 10) / 10;
    }
    handleLoc.text( '(' + mm + ', ' +
      self.x2code(newX) + ')');
    handleLoc.y(newY);

    // If this is not the top snow layer, update the diagonal line
    // owned by the snow layer above.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setDiagLine();
    }
    //depthVal = self.y2depth(newY);
    self.draw();
    return {
      x: newX,
      y: newY
    };
  });

  /**
   * Animate the uninitialized handle to draw the user's attention
   *
   * For some reason this must be done after handle.draggable() not before.
   */
//  handle.animate({ease: SVG.easing.backInOut, duration: '1000'})
//    .size(SnowProfile.Cfg.HANDLE_SIZE / 1.4, SnowProfile.Cfg.HANDLE_SIZE / 1.4)
//    .loop();

  /**
   * Text to show current handle location.
   *
   * The text appears to the right of the grid, at the same Y position as the
   * handle.  The depth value is in cm and tenths referenced according to the
   * grid scale.  This text is normally hidden, and shows when the mouse is
   * over the handle.
   * @type {Object}
   * @todo Style
   */
  var handleLoc = SnowProfile.drawing.text("")
  .font({
    size: 12,
    style: 'bold',
    family: 'sans-serif',
    fill: SnowProfile.Cfg.LABEL_COLOR,
  })
  .x(SnowProfile.Cfg.DEPTH_LABEL_WD + 1 + SnowProfile.Cfg.GRAPH_WIDTH + 10)
  .y(SnowProfile.depth2y(depthVal))
  .hide();

  /**
   * "Edit" button
   * @type {Object}
   */
  var editButton = new SnowProfile.Button("Edit");

  /**
   * "Insert" button
   * @type {Object}
   */
  var insertButton = new SnowProfile.Button("Insert");

  /**
   * Define a diagonal line from the bottom of this layer right to the
   * line below the description of this layer.
   * @type {Object}
   */
  var diagLine = SnowProfile.drawing.line(0, 0, 0, 0)
  .stroke({
    color: SnowProfile.Cfg.GRID_COLOR,
    width: 1
  });

  /**
   * Define a rectangle to outline the layer
   * @type {Object}
   * @todo Style
   */
  var layerOutline = SnowProfile.drawing.rect(0,0)
    .addClass('snow_profile_layer_outline')
    .style({
      fill: 'white',
      opacity: 0.85,
      stroke: '#000'
     })
    .x(SnowProfile.Cfg.DEPTH_LABEL_WD + 1)
    .y(0);

  /**
   * Get or set depth in cm of this snow layer
   * @param {number} [depthArg] - Depth of the top of this snow layer in cm
   * @returns {number} Depth of the snow layer if param omitted.
   */
  this.depth = function(depthArg) {
    if (depthArg === undefined) {
      return depthVal;
    }
    else {
      depthVal = depthArg;
    }
  };

  /**
   * Get index of this object in snowLayers[]
   * @returns {number} Integer index into snowLayers[]
   */
  this.getIndex = function() {
    var i;
    var numLayers = SnowProfile.snowLayers.length;
    for (i = 0; i < numLayers; i++) {
      if (SnowProfile.snowLayers[i] === self) {
        return i;
      }
    }
    console.error("Object not found in snowLayers[]");
  };

  /**
   * Make the handle visible
   */
  function handleVisible() {
    handle.show();
//    self.draw();
  }

  /**
   * Make the handle invisible
   */
  function handleInvisible() {
    handle.hide();
//    self.draw();
  }

  /**
   * Remove and destroy all SVG objects belonging to this snow layer
   */
  function destroy() {
    handle.off('mouseup mousedown mouseover mouseout');
    $(document).unbind("SnowProfileHideControls", handleInvisible);
    $(document).unbind("SnowProfileShowControls", handleVisible);
    $(document).unbind("SnowProfileAdjustGrid", self.draw);
    handle.remove();
    layerDescr.clear();
    handleLoc.remove();
    layerOutline.remove();
    diagLine.remove();
    editButton.destroy();
    insertButton.destroy();
  }

  /**
   * Define end points of a diagonal line from the handle of the layer below
   * this layer to the line below the description of this layer.
   * @returns {number[]} Two-dimensional array of numbers of the starting
   * and ending points for the diagonal line.
   */
  function diagLinePts() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    var xLeft,
    yLeft,
    xRight,
    yRight,
    points;

    if (i === (numLayers - 1)) {

      // This snow layer is the bottom snow layer.  The Y dimension of the
      // left end of the line is the bottom of the graph
      yLeft = SnowProfile.handleMaxY + (SnowProfile.Cfg.HANDLE_SIZE / 2);
    }
    else {

      // This is not the bottom snow layer, so the Y dimension of the left end
      // is the Y of the handle of the snow layer below this snow layer.
      yLeft = SnowProfile.snowLayers[i + 1].handleGetY() +
        SnowProfile.Cfg.HANDLE_SIZE / 2;
    }

    // Y dimension of the right end is the Y of the line below the
    // description of this snow layer.
    yRight = SnowProfile.lineBelowY(i);

    // X dimension of the left end is the right edge of the graph
    xLeft = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 + SnowProfile.Cfg.GRAPH_WIDTH;

    // X dimension of the right end is the left end of the line
    // below the description of this snow layer.
    xRight = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
      SnowProfile.Cfg.GRAPH_WIDTH + 1 + SnowProfile.Cfg.CTRLS_WD - 3;
    points = [xLeft, yLeft, xRight, yRight];
    return points;
  }

  /**
   * Delete this layer and make necessary adjustments
   */
  this.deleteLayer = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // Remove this Layer from the snowLayers array
    SnowProfile.snowLayers.splice(i, 1);

    // Destroy SVG objects of this layer
    destroy();

    // If the layer we just removed was not the top layer,
    // tell the layer above to adjust itself.
    if (i > 0) {
      SnowProfile.snowLayers[i-1].draw();
    }
    else {

      // We just removed the top layer.  The layer that was
      // below it is the new top layer so set its depth.
      SnowProfile.snowLayers[0].depth(0);
    }

    // If the layer we just removed was not the bottom layer,
    // tell the layer below to adjust itself.
    if (i !== (numLayers - 1)) {
      SnowProfile.snowLayers[i].draw();
    }
    numLayers--;

    // Update location of SVG objects whose position
    // depends on the index of the layer
    SnowProfile.setIndexPositions();
  };

  /**
   * Get or set description of this snow layer
   *
   * Called from the modal dialogue popup with data from the popup
   * @callback
   * @memberof SnowProfile.Layer
   * @param {Object} [data] - Object describing the snow layer.
   * @returns {Object} Object describing the snow layer if param omitted.
   * @namespace {function} SnowProfile.Layer.describe
   */
  this.describe = function(data) {

    var cdBbox, giBbox, gsBbox, ldBbox;

    /**
     * Generate a text description of grain shapes from symbols
     *
     * Accept grain shape symbols selected by the user, if any, and
     * return a text description of the form.  The description is
     * constructed by looking up the symbols in CAAML_SHAPE and
     * CAAML_SUBSHAPE to find the equivalent text.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @returns {string} Text description of the grain shapes
     * @memberof SnowProfile.Layer.describe
     */
    function sym2text(primaryShape, primarySubShape, secondaryShape,
      secondarySubShape) {

      var result = "";
      if (primaryShape !== "") {

        // Grain shape information is available
        if (secondaryGrainShape !== "") {

          // Both primary and secondary shapes so identify them
          result += "Primary Grain Shape:\n";
        }
        result += SnowProfile.CAAML_SHAPE[primaryShape].text;
        if (primarySubShape !== "") {

          // Primary subshape available, add to text description
          result += "\n" +
            SnowProfile.CAAML_SUBSHAPE[primaryShape][primarySubShape].text;
        }
        if (secondaryGrainShape !== "") {

          // Secondary shape information available
          result += "\nSecondary Grain Shape:\n" +
            SnowProfile.CAAML_SHAPE[secondaryShape].text;
          if (secondarySubShape !== "") {
            result += "\n" +
              SnowProfile.CAAML_SUBSHAPE[secondaryShape][
              secondarySubShape].text;
          }
        }
      }
      return result;
    } // function sym2text

    /**
     * Generate an icon description for Melt-freeze crust
     *
     * Generate the appropriate Melt-freeze crust icon for the
     * the specified secondary shape, if any
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container SVG.G group object to hold icons
     * @memberof SnowProfile.Layer.describe
     */
    function sym2iconsMFcr(secondaryShape, secondarySubShape, container) {
      var primaryIcon,
        secondaryIcon;

      // Special Melt-freeze crust icon allowing space on the right
      // side to insert a secondary form
      var image = "iVBORw0KGgoAAAANSUhEUgAAADQAAAAdCAYAAADl208VAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz" +
"AAAT9gAAE/YBIx4x4QAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAQDSURB" +
"VFiFxdhbiFVlFAfw3z6TQg46NVbeMiqpxGrsZqUGlkgmCfngQ/Vg0UMPQS8hhFGgkW8VvUhFF3qq" +
"QBAi7QIiRURgmWKFl1BQIbOLpjWZt3YPe21mz+nss/dxxnHBx8fea63/+tZ3XWslaZqqoiRJerAI" +
"i3EtJuFS/IH9OIDP8X6apr9UAg7GvgwPYh6m4gpchF9xELuxHh+naXq0EjBN09KGy/E2TiKt0U7h" +
"I8xphxvYc0L2VE3sk3gLU9rilhjrwvM4XgD8AauxEH2YEP1SPIOtBdl/8SbGt8C+GK+HTC6/NTCW" +
"NmHfFzZ3FGT78RwatRwKg58WAPbgnqoZD9352FDQPYRbCvw+/FTgb8D8mtj3Yl9Bdz3GtXUIvdgZ" +
"CmfwCsbUMdiE83DMZCo7Z3Njix2Jf3/hobPAHRurmzv1HXpaOoRR2BSC+zC3U4NNxmdib2Gb5A7u" +
"xg1DxF6AnwPvE3S1cujFEDiN2RWAXZiOsRVyE5u2yV5cMhRnmrZgjvvCIIdwNU4Ec3UJwAV4Cp/h" +
"z8K23I41mFii1xfyx3D9cDhTwF4T4/gHVxYdei8Y32JUyfbZUpiRNA538To/jGUlhhfj/uF0JnDH" +
"YFfYfzf+6ZW9BWdazSBmxAzkN94ScR1jNG7DuoJjy4d74BVOzTbwBvbCsvjxZclZ2Rz8dehuA/xY" +
"YfmHdWvVcGp72F4Ga+Pj6RaCTwbvgKbrsQT4nbLJOccOrQy7axuYJqNv/J8WRL8qrRNHsTyA70yS" +
"ZFwN+eGir6Of1pAFmmSHvJlujf6rOqhpmv4me5gbsrM1UpSPfVJDHCT8XpRIkqQbU2Qz/mMH4Dui" +
"nz6UEXZI+dh7G7LrFsYXJdI07Zd5nuCaDsBnRL9zKCPskPKxH27Icg6Y3EJwS/Rz66AmSTIB18lW" +
"tdWZPFeUj/1gQ/a20HrPb4p+ZZIkvS34zfSybEU3p2l6bGhj7IhmRb+H9u/QKAN5zodahOsF2SdC" +
"7gRmns93qCpS6DMQ5+2XpctTgteNuwzOgVaMsDODI4X4WRXLzZLlHsVY7nBMQv59FI+XGB25WC4Y" +
"daLt0bI0+QsD0fZpfI83MLVEb+Sj7WB2kg8luEpFNut85UMh0JyxVlZuKgzebCBjPRYtf6T7hog9" +
"X1XGGoLNNYWXcOFZGHzUQMXoCO7A7bIXPcXfeOQscLtjm+UVo/KaQkGpueqzq+5qyUpcGwu6h3BT" +
"gX+jwVWfjVhYE3ue7J3JdaurPgXlLqyKmcwBtsjqYfNk1dMeWby2BCuwrSDbaV1uW2AsCcyesHF3" +
"2CzW/PrxrLp1uSbjk/GawQXHdu1cVk6P41UltYu8JQHeliLyXoQHZLHaSNa2d+EDWW27vwrvP/t3" +
"1UVx0/hpAAAAAElFTkSuQmCC";

      if (secondaryShape === "") {
        // There is no secondary shape so we just use the normal MFcr icon
        primaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
          SnowProfile.CAAML_SUBSHAPE.MF.MFcr.icon.image,
          SnowProfile.CAAML_SUBSHAPE.MF.MFcr.icon.height,
          SnowProfile.CAAML_SUBSHAPE.MF.MFcr.icon.width);
        container.add(primaryIcon)
          .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
      }
      else {

        // There is a secondary shape, so use the alternative MFcr icon
        primaryIcon = SnowProfile.drawing.image(
          "data:image/png;base64," + image, 52, 29)
          .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
        container.add(primaryIcon);
        if (secondarySubShape === "") {
          // User did not specify a secondary subshape
          secondaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
            SnowProfile.CAAML_SHAPE[secondaryShape].icon.image,
            SnowProfile.CAAML_SHAPE[secondaryShape].icon.width,
            SnowProfile.CAAML_SHAPE[secondaryShape].icon.height)
            .cx(((SnowProfile.CAAML_SHAPE[secondaryShape]
              .icon.width) / 2) + 30)
            .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
        }
        else {
          // User specified a secondary subshape
          secondaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
            SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
            icon.image,
            SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
            icon.width,
            SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
            icon.height)
            .cx(((SnowProfile.CAAML_SUBSHAPE[secondaryShape]
              [secondarySubShape].icon.width) / 2) + 30)
            .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
        }
        container.add(secondaryIcon);
      }
    } // function sym2iconsMFcr()

    /**
     * Generate an icon description for normal case
     *
     * Accept grain shape symbols selected by the user, if any, and
     * return an icon description of the form.  The description is
     * constructed by looking up the symbols in
     * {@link SnowProfile.CAAML_SHAPE} and
     * {@link SnowProfile.CAAML_SUBSHAPE} to find the equivalent icons.  It
     * has been determined that the primary subshape is NOT Melt-freeze
     * crust.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container SVG.G group object to hold icons
     * @memberof SnowProfile.Layer.describe
     */
    function sym2iconsNormal(primaryShape, primarySubShape, secondaryShape,
      secondarySubShape, container) {

      var primaryIcon,
        secondaryIcon;
      var iconCursor = 0;

      if (primaryShape !== "") {

        // User specified a primary grain shape

        if (primarySubShape !== "") {

          // User specified both primary grain shape and subshape
          // Add the icon for the primary grain subshape
          primaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
            SnowProfile.CAAML_SUBSHAPE[primaryShape][primarySubShape].
            icon.image,
            SnowProfile.CAAML_SUBSHAPE[primaryShape][primarySubShape].
            icon.width,
            SnowProfile.CAAML_SUBSHAPE[primaryShape][primarySubShape].
            icon.height);
          iconCursor += SnowProfile.CAAML_SUBSHAPE[primaryShape]
            [primarySubShape].icon.width;
        }
        else {

          // User specified a primary grain shape but no subshape
          // Add the icon for the primary grain shape
          primaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
            SnowProfile.CAAML_SHAPE[primaryShape].icon.image,
            SnowProfile.CAAML_SHAPE[primaryShape].icon.width,
            SnowProfile.CAAML_SHAPE[primaryShape].icon.height);
          iconCursor += SnowProfile.CAAML_SHAPE[primaryShape].icon.width;
        }
        container.add(primaryIcon);
        primaryIcon.cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
        if (secondaryShape !== "") {

          // User specified a secondary grain shape
          // Add left paren to the icons
          iconCursor += 3;
          //FIXME vertical displacement should be calculated from bbox
          container.add(SnowProfile.drawing.text("(")
            .x(iconCursor)
            .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2));
          iconCursor += 7;

          // Add secondary grain shape icon
          if (secondarySubShape !== "") {

            // User specified both secondary grain shape and subshape
            // Add the icon for the secondary grain subshape

            secondaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
              SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
              icon.image,
              SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
              icon.width,
              SnowProfile.CAAML_SUBSHAPE[secondaryShape][secondarySubShape].
              icon.height).x(iconCursor);
            iconCursor += SnowProfile.CAAML_SUBSHAPE[secondaryShape]
              [secondarySubShape].icon.width;
          }
          else {

            // User specified a secondary grain shape but no subshape
            // Add the icon for the primary grain shape
            secondaryIcon = SnowProfile.drawing.image("data:image/png;base64," +
              SnowProfile.CAAML_SHAPE[secondaryShape].icon.image,
              SnowProfile.CAAML_SHAPE[secondaryShape].icon.width,
              SnowProfile.CAAML_SHAPE[secondaryShape].icon.height)
            .x(iconCursor);
            iconCursor += SnowProfile.CAAML_SHAPE[secondaryShape].icon.width;
          }
          container.add(secondaryIcon);
          secondaryIcon.cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);

          // Add right paren to the icons
          iconCursor += 3;
          //FIXME vertical displacement should be calculated from bbox
          container.add(SnowProfile.drawing.text(")")
            .x(iconCursor)
            .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2));
        }
      }
    } // function sym2iconsNormal()

    /**
     * Generate an icon description of grain shapes from symbols
     *
     * Accept grain shape symbols selected by the user, if any, and
     * return an icon description of the form.  The description is
     * constructed by looking up the symbols in
     * {@link SnowProfile.CAAML_SHAPE} and
     * {@link SnowProfile.CAAML_SUBSHAPE} to find the equivalent icons.
     * There are two cases:
     *   + If the primary subshape is Melt-freeze crust, then the
     *     secondary shape is incorporated into the MFcr icon.
     *   + In all other cases, the secondary shape in parentheses follows
     *     the primary shape.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container SVG.G group object to hold icons
     * @memberof SnowProfile.Layer.describe
     */
    function sym2icons(primaryShape, primarySubShape, secondaryShape,
      secondarySubShape, container) {

      if (primaryShape !== "") {
        if (primarySubShape === "MFcr") {

          // Case 1) Melt-freeze crust, secondary goes inside
          sym2iconsMFcr(secondaryShape, secondarySubShape, container);
        }
        else {

          // Case 2) secondary follows primary in parentheses
          sym2iconsNormal(primaryShape, primarySubShape, secondaryShape,
            secondarySubShape, container);
        }
      }
    } // function sym2icons

    // Main body of this.describe function
    if (data === undefined) {

      // Called with no argument, return an object with the values
      return {
        primaryGrainShape: primaryGrainShape,
        primaryGrainSubShape: primaryGrainSubShape,
        secondaryGrainShape: secondaryGrainShape,
        secondaryGrainSubShape: secondaryGrainSubShape,
        grainSize: grainSize,
        comment: comment,
        layer: self,
        numLayers: SnowProfile.snowLayers.length
      };
    } // if (data === undefined)
    else {

      // Called with an argument so set values for layer
      primaryGrainShape = data.primaryGrainShape;
      primaryGrainSubShape = data.primaryGrainSubShape;
      secondaryGrainShape = data.secondaryGrainShape;
      secondaryGrainSubShape = data.secondaryGrainSubShape;
      giBbox = null;
      grainSize = data.grainSize;
      gsBbox = null;
      comment = data.comment;
      cdBbox = null;
      ldBbox = null;

      // Empty the grain shape icon group and text description
      grainIcons.clear();
      if (primaryGrainShape !== "") {

        // The user gave us grain shape information.
        // Build a text description of grain shape from what we have
        var text = sym2text(primaryGrainShape, primaryGrainSubShape,
          secondaryGrainShape, secondaryGrainSubShape);
        text = text; // to suppress JSHint "unused" error

        // Build an iconic description of grain shape from what we have
        sym2icons(primaryGrainShape, primaryGrainSubShape,
          secondaryGrainShape, secondaryGrainSubShape, grainIcons);
      }

      // For debugging show the grain shape icon bounding box
      var giBbox = grainIcons.bbox();
      giBox.width(giBbox.width);
      giBox.height(giBbox.height);
      giBox.x(giBbox.x);
      giBox.y(giBbox.y);

      // Empty the grain size text description
      grainSizeText.text("");
      if (grainSize !== "") {

        // The user gave us grain size information.
        // Build a text description of grain size from what we have.
        grainSizeText.text(SnowProfile.CAAML_SIZE[grainSize])
          .cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
      }

      // For debugging show the grain size bounding box
      var gsBbox = grainSizeText.bbox();
      gsBox.width(gsBbox.width);
      gsBox.height(gsBbox.height);
      gsBox.x(gsBbox.x);
      gsBox.y(gsBbox.y);
//      ldBbox = giBbox.merge(gsBbox);

      // Comment description
      commentDescr.text("");
      if (comment !== "") {

        // The user gave us a comment.
        // Build a text description of the comment from what we have.
        commentDescr.text(comment).cy(SnowProfile.Cfg.DESCR_HEIGHT / 2);
      }

      // For debugging show the comment description bounding box
      cdBbox = commentDescr.node.firstChild.getBoundingClientRect();
      console.info('cdBbox=', cdBbox);
      ldBbox = layerDescr.node.getBoundingClientRect();
      console.info('ldBbox=', ldBbox);
      cdBox.width(cdBbox.width);
      cdBox.height(cdBbox.height);
      cdBox.x(cdBbox.x - ldBbox.x - SnowProfile.Cfg.COMMENT_SPACE_WD);
      cdBox.y(cdBbox.y - ldBbox.y);
    } // if (data === undefined) ... else

    // Re-draw the diagram with the updated information
    self.setIndexPosition();
    //self.draw();
  }; // this.describe = function(data) {

  /**
   Return the current X position of the handle
   @returns {number}
   */
  this.handleGetX = function() {
    return handle.x();
  };

  /**
   Return the current Y position of the handle
   @returns {number}
   */
  this.handleGetY = function() {
    return handle.y();
  };
  this.scale = function(factor) {
    layerDescr.scale(factor, factor);
  };


  /**
   * Set position and length of the diagonal line at bottom of this layer
   *
   */
  this.setDiagLine = function() {
    diagLine.plot.apply(diagLine, diagLinePts());
  };

  /**
   * Set coordinates of the layer outline
   */
  this.setLayerOutline = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    var yTop = handle.y() +  (SnowProfile.Cfg.HANDLE_SIZE / 2);
    var yBottom = SnowProfile.Cfg.HANDLE_SIZE / 2;
    if (i === (numLayers - 1)) {

      // This is the bottom layer so bottom Y is bottom of graph
      yBottom += SnowProfile.handleMaxY;
    }
    else {

      // Not the bottom layer so bottom Y is top of next lower layer
      yBottom += SnowProfile.snowLayers[i+1].handleGetY();
    }
    if (handle.x() !== SnowProfile.Cfg.HANDLE_INIT_X) {
      layerOutline.width(handle.x() - SnowProfile.Cfg.DEPTH_LABEL_WD - 1);
    }
    layerOutline.y(yTop);
    layerOutline.height(yBottom - yTop);
  };

  /**
   * Draw this layer from depth and hardness values and adjacent layers.
   *
   * Redraw as necessary to respond to movement of the handle at the
   *   top of this layer.
   */
  this.draw = function() {
    var i = self.getIndex();

    // Set handle X from hardness
    if (handleTouched) {
      handle.x(self.code2x(hardness));
    }
    else {
      handle.x(SnowProfile.Cfg.HANDLE_INIT_X);
    }

    // Set handle Y from depth
    handle.y(SnowProfile.depth2y(depthVal));

    // Adjust the rectangle that outlines this layer
    self.setLayerOutline();

    // Adjust the diagonal line to the description area
    self.setDiagLine();

    // Adjust the outline of the layer above, if any
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setLayerOutline();
    }
  }; // this.draw = function() {

  /**
   * Push this layer down to make room to insert a layer above.
   *
   * Add an increment to the depth of this layer and all layers below
   * to the bottom.
   */
  this.pushDown = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    // Is this the bottom layer?
    if (i !== (numLayers - 1)) {

      // This isn't the bottom layer so we need to push it down.  How much
      // space is there between this snow layer and the snow layer below?
      var spaceBelow = SnowProfile.snowLayers[i + 1].depth() - depthVal;
      if (spaceBelow < (2 * SnowProfile.Cfg.INS_INCR)) {

        // Not enough so we need to make space below this snow layer.
        SnowProfile.snowLayers[i + 1].pushDown();
      }
    }

    // Add the insertion increment to this layer
    depthVal += SnowProfile.Cfg.INS_INCR;
    self.draw();
  };

  /**
   * Set handle visibility, if it is untouched
   *
   * @param {boolean} visible Make the handle visible?
   */
  this.setHandleVisibility = function(visible) {
    if (!handleTouched) {

      // The user hasn't this handle since it was inited, so blink
      handle.setStroke(visible ? "#000" : "#FFF");
    }
    else {

      // The user has touched the handle so make it always visible
      handle.setStroke("#000");
    }
  };

  /**
   * Set the Y position of those parts of the layer whose Y position
   * depends on the index of the snow layer in snowpack not its depth.
   * This is needed when a layer is inserted or deleted.
   */
  this.setIndexPosition = function() {
    var i = self.getIndex();
    layerDescr.y(SnowProfile.Cfg.HANDLE_MIN_Y +
      (i * SnowProfile.Cfg.DESCR_HEIGHT) +
      (SnowProfile.Cfg.HANDLE_SIZE / 2));
    lineBelow.plot(
      -3, SnowProfile.Cfg.DESCR_HEIGHT,
      SnowProfile.Cfg.GRAIN_SHAPE_WD + SnowProfile.Cfg.GRAIN_SPACE_WD +
        SnowProfile.Cfg.GRAIN_SIZE_WD + SnowProfile.Cfg.COMMENT_SPACE_WD +
        SnowProfile.Cfg.COMMENT_WD,
      SnowProfile.Cfg.DESCR_HEIGHT
    );
    diagLine.plot.apply(diagLine, diagLinePts());
    editButton.setY(SnowProfile.Cfg.HANDLE_MIN_Y +
      (SnowProfile.Cfg.HANDLE_SIZE / 2) +
      (SnowProfile.Cfg.DESCR_HEIGHT / 2) + (i * SnowProfile.Cfg.DESCR_HEIGHT));
    insertButton.setY(SnowProfile.lineBelowY(i));
    // If this is not the top snow layer, update the diagonal line
    // owned by the snow layer above.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setDiagLine();
    }

    // Move handle closest to user
    handle.front();
  };

  // Insert this Layer in the appropriate place in the snow pack.
  var i,
    numLayers = SnowProfile.snowLayers.length,
    inserted = false;

  // Insert this snow layer above the first snow layer that is
  // at the same depth or deeper.
  for (i = 0; i < numLayers; i++) {
    if (SnowProfile.snowLayers[i].depth() >= depthVal) {

      // Insertion point found, we need to insert above snowLayers[i].
      // How much space is there between this layer and that layer?
      var spaceBelow = SnowProfile.snowLayers[i].depth() - depthVal;
      if (spaceBelow < SnowProfile.Cfg.INS_INCR) {

        // Not enough so we need to make space below this snow layer.
        SnowProfile.snowLayers[i].pushDown();
      }

      // Insert this snow layer.
      SnowProfile.snowLayers.splice(i, 0, this);
      inserted = true;
      break;
    }
  }

  // If no deeper snow layer was found, add this layer at the bottom.
  // This also handles the initial case where there were no snow layers.
  if (!inserted) {
    SnowProfile.snowLayers.push(this);
  }

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", handleInvisible);

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", handleVisible);

  // Listen for "SnowProfileAdjustGrid" events
  $(document).bind("SnowProfileAdjustGrid", self.draw);

  /**
   * When mouse hovers over handle, show handle location
   *
   * @callback
   */
  handle.mouseover(function() {
    handle.style('cursor', 'pointer');
    if (handleTouched) {
      handleLoc.show();
    }
  });

  /**
   Style the cursor for the handle
   @callback
   */
  handle.mouseout(function() {
    handleLoc.hide();
  });

  /**
   When the handle is in use, show its location to the right.
   @callback
   */
  handle.mousedown(function() {
    handleTouched = true;
  });

  /**
   When the mouse releases the handle, stop showing its location.
   @callback
   */
  handle.mouseup(function() {
    handleLoc.hide();
    handle.x(self.code2x(hardness));
  });

  // When Edit button clicked, pop up a modal dialog form.
  $(document).bind("SnowProfileButtonClick", function(evt, extra) {
    if (extra.buttonObj === editButton) {
      SnowProfile.PopUp(self.describe());
    }
  });

  // When Insert button clicked, insert a snow layer below this one.
  $(document).bind("SnowProfileButtonClick", function(evt, extra) {
    if (extra.buttonObj === insertButton) {
      var i = self.getIndex();
      var numLayers = SnowProfile.snowLayers.length;

      // Is this the bottom layer?
      if (i !== (numLayers - 1)) {

        // We need space for a layer below this one.  Calculate the space
        // available between this layer and the layer below it.
        var spaceBelow = SnowProfile.snowLayers[i + 1].depth() - depthVal;
        if (spaceBelow < ( 2 * SnowProfile.Cfg.INS_INCR)) {

          // Not enough so we need to make space below this snow layer.
          SnowProfile.snowLayers[i + 1].pushDown();
          SnowProfile.snowLayers[i + 1].pushDown();
        }
      }
      new SnowProfile.Layer(depthVal + SnowProfile.Cfg.INS_INCR);
    }
  });

  // Draw the layer
  self.draw();

  // Set the location of SVG objects dependent on index of layer
  // for all layers, since inserting a layer disarranged those objects.
  SnowProfile.setIndexPositions();
}; // function SnowProfile.Layer()

/**
 Convert a hardness code to an X axis position.
 @param {string} code A CAAML hardness code from the CAAML_HARD table.
 @returns {number} X axis position
 */
SnowProfile.Layer.prototype.code2x = function(code) {
  "use strict";
  var x = SnowProfile.Cfg.DEPTH_LABEL_WD + 1;
  if (code !== null) {
    for (var i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      if (code === SnowProfile.CAAML_HARD[i][0]) {
        x = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
          (SnowProfile.Cfg.HARD_BAND_WD * i) +
          (SnowProfile.Cfg.HANDLE_SIZE / 2);
        break;
      }
    }
  }
  return x;
};

/**
 Convert an X axis position to a hardness code
 @param {number} x X axis position.
 @returns {string} CAAML hardness code.
 */
SnowProfile.Layer.prototype.x2code = function(x) {
  "use strict";
  var code = 'I';

  for (var i = 0; i < SnowProfile.CAAML_HARD.length - 1; i++) {
    if ((x >= (SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
        (SnowProfile.Cfg.HARD_BAND_WD * i) + (SnowProfile.Cfg.HANDLE_SIZE / 2)) &&
       (x < (SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
        (SnowProfile.Cfg.HARD_BAND_WD * (i + 1)) +
        (SnowProfile.Cfg.HANDLE_SIZE / 2))))) {
      code = SnowProfile.CAAML_HARD[i][0];
      break;
    }
  }
  return code;
};

/**
 Convert a Y axis position to a depth in cm.
 @param {number} y Y axis position.
 @returns {number} Depth of this layer in cm.
 */
SnowProfile.Layer.prototype.y2depth = function(y) {
  "use strict";
  return (y - SnowProfile.Cfg.HANDLE_MIN_Y) / SnowProfile.Cfg.DEPTH_SCALE;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
