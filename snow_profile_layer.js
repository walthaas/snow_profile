/**
  @file Define the object that describes a snow layer
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
  Object describing a single snow stratigraphy layer.
  @param {number} depth Initial depth in cm of this layer from the top
  of the snow pack.
  @constructor
  @listens SnowProfileAdjustGrid
  @listens SnowProfileButtonClick
  @listens SnowProfileHideControls
  @listens SnowProfileShowControls
 */
SnowProfile.Layer = function(depthArg) {
  "use strict";

  // Reference this object inside an event handler
  var self = this;

  /**
   * @summary Depth of the top of this snow layer in cm from the snow surface.
   * @desc Initialized to the argument passed to the constructor and adjusted
   * whenever the user moves the handle for this snow layer.
   * @type {number}
   */
  var depthVal = depthArg;

  /**
   * @summary Grain shape of this layer.
   * @desc Two- or four-character code from the
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
   * @summary Grain size of this snow layer.
   * @desc Code from the
   * [CAAMLv5 IACS Snow Profile schema definition]{@link http://caaml.org/Schemas/V5.0/Profiles/SnowProfileIACS/CAAMLv5_SnowProfileIACS.xsd}
   * GrainSizeBaseEnumType as stored in {@link SnowProfile.CAAML_SIZE}.
   * @type {string}
   */
  var grainSize = "";

  // /**
  //  * @summary Liquid water content of this snow layer
  //  * @type {string}
  //  */
  // var lwc = "";

  // /**
  //  * @summary Text for the liquid water content.
  //  * @desc [Kinetic.Text]{@link http://kineticjs.com/docs/Kinetic.Text.html}
  //  * object for text describing the liquid water content of this snow layer.
  //  * @type {Object}
  //  */
  // var LWCDescr = new Kinetic.Text({
  //   width: SnowProfile.LWC_WD,
  //   fontSize: 12,
  //   fontFamily: 'sans-serif',
  //   fill: "#000",
  //   align: 'left',
  //   x: SnowProfile.LWC_LEFT
  // });

  /**
   * @summary User's comment about this snow layer
   * @desc The comment character string entered by the user to comment
   * on this snow layer.
   * @type {string}
   */
  var comment = "";

  /**
   * @summary Text for the comment.
   * @desc [Kinetic.Text]{@link http://kineticjs.com/docs/Kinetic.Text.html}
   * object for text describing the user's comment on this snow layer.  It
   * contains the character string entered by the user from
   * {@link SnowProfile.Layer~comment} plus additional
   * information to format this string on the browser window.
   * @type {Object}
   */
  var commentDescr = new Kinetic.Text({
    width: SnowProfile.COMMENT_WD,
    fontSize: 14,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.COMMENT_LEFT
  });

  /**
   Has the user touched the handle since this layer was created?

   Used to make an untouched handle throb visibly, to draw the user's
   attention to the need to set the handle position.
   @type {boolean}
   */
  var handleTouched = false;

  /**
   * @summary Hardness of this snow layer.
   * @desc A string code from the {@link SnowProfile.CAAML_HARD} table.
   * The initial value of null indicates the handle for this snow layer has not
   * yet been touched by the user.
   * @type {string}
   */
  var hardness = null;

  /**
   * @summary Text for the grain size
   * @desc [Kinetic.Text]{@link http://kineticjs.com/docs/Kinetic.Text.html}
   * object for text giving th grain size of this snow layer.
   * @type {Object}
   */
  var grainSizeText = new Kinetic.Text({
    width: SnowProfile.GRAIN_WD,
    fontSize: 14,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.GRAIN_LEFT + SnowProfile.GRAIN_FORM_WD +
      SnowProfile.GRAIN_SPACE_WD
  });

  /**
   * @summary Group to hold the icons describing this layer's grains
   * @desc [Kinetic.Group]{@link http://kineticjs.com/docs/Kinetic.Group.html}
   * object holding icons describing the grain shape of this snow layer.
   * @type {Object}
   */
  var grainIcons = new Kinetic.Group({
    x: SnowProfile.GRAIN_LEFT,
    y: 0
  });

  /**
   * @summary Horizontal line below the description
   * @desc [Kinetic.Line]{@link http://kineticjs.com/docs/Kinetic.Line.html}
   * object for a horizontal line below the text description of this snow
   * layer.  This line visually separates the descriptions of the various
   * snow layers.
   * @type {Object}
   */
  var lineBelow = new Kinetic.Line({
    points: [0, 0, 0, 0],
    stroke: SnowProfile.GRID_COLOR,
    strokeWidth: 1
  });

  /**
   * Handle for the line at the top of the layer.
   *
   * The user drags and drops this handle to adjust depth and hardness.
   * @type {Object}
   */
  var handle = new Kinetic.Rect({
    x: SnowProfile.HANDLE_MIN_X,
    y: SnowProfile.depth2y(depthVal),
    width: SnowProfile.HANDLE_SIZE,
    height: SnowProfile.HANDLE_SIZE,
    offsetX: SnowProfile.HANDLE_SIZE / 2,
    fill: '#000',
    draggable: true,
    dragBoundFunc: function(pos) {

      var newX = pos.x;
      var newY = pos.y;
      var i = self.getIndex();
      var numLayers = SnowProfile.snowLayers.length;

      // X (hardness) position is bound by the edges of the graph.
      if (pos.x < SnowProfile.HANDLE_MIN_X) {
        newX = SnowProfile.HANDLE_MIN_X;
      }
      else if (pos.x > SnowProfile.HANDLE_MAX_X) {
        newX = SnowProfile.HANDLE_MAX_X;
      }

      // Y (depth) position is limited by the depth of the snow layers
      // above and below in the snow pack, or by air and ground.
      if (i === 0) {

        // This is the top (snow surface) layer.
        // Handle stays on the surface.
        newY = SnowProfile.HANDLE_MIN_Y;
      }
      else if (i === (numLayers - 1)) {

        // This is the bottom layer.  The handle depth is constrained
        // between the layer above and GRAPH_HEIGHT.
        if (pos.y > (SnowProfile.handleMaxY)) {
          newY = SnowProfile.handleMaxY;
        }
        else if (pos.y < SnowProfile.snowLayers[i - 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
        }
      }
      else {

        // This layer is below the surface and above the bottom.
        // The handle depth is constrained between layers above and below.
        if (pos.y > SnowProfile.snowLayers[i + 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i + 1].handleGetY() - 1;
        }
        else if (pos.y < SnowProfile.snowLayers[i - 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
        }
      }
      depthVal = self.y2depth(newY);
      return {
        x: newX,
        y: newY
      };
    }
  }); // handle = new Kinetic.Rect({

  /**
   * Text to show current handle location.
   * @type {Object}
   */
  var handleLoc = new Kinetic.Text({
    x: SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 10,
    y: SnowProfile.depth2y(depthVal),
    fontSize: 12,
    fontStyle: 'bold',
    fontFamily: 'sans-serif',
    fill: SnowProfile.LABEL_COLOR,
    align: 'left',
    visible: 0
  });

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
  var diagLine = new Kinetic.Line({
    points: [0, 0, 0, 0],
    stroke: SnowProfile.GRID_COLOR,
    strokeWidth: 1
  });

  /**
   * Define a rectangle to outline the layer
   * @type {Object}
   */
  var layerOutline = new Kinetic.Rect({
    x: SnowProfile.DEPTH_LABEL_WD + 1,
    y:0,
    width: 0,
    height: 0,
    fill: "white",
    opacity: 0.85,
    stroke: '#000'
  });

  /**
   * Get or set depth in cm of this snow layer
   * @param {number} [depth] - Depth of the top of this snow layer in cm
   * @returns {number} Depth of the snow layer if param omitted.
   */
  this.depth = function(depthArg) {
    if (depthArg === undefined) {
      return depthVal;
    }
    else {
      depthVal = depthArg;
      self.draw();
    }
  };

  /**
   Get index of this object in snowLayers[]
   @returns {number} Integer index into snowLayers[]
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
   Make the handle visible
   */
  function handleVisible() {
    handle.setVisible(true);
    self.draw();
  }

  /**
    Make the handle invisible
   */
  function handleInvisible() {
    handle.setVisible(false);
    self.draw();
  }

  /**
   * Remove and destroy all KineticJS objects belonging to this snow layer
   */
  function destroy() {
    handle.off('mouseup mousedown dragmove mouseover mouseout');
    $(document).unbind("SnowProfileHideControls", handleInvisible);
    $(document).unbind("SnowProfileShowControls", handleVisible);
    $(document).unbind("SnowProfileAdjustGrid", self.draw);
    handle.destroy();
    grainSizeText.destroy();
    grainIcons.destroy();
//    LWCDescr.destroy();
    commentDescr.destroy();
    lineBelow.destroy();
    handleLoc.destroy();
    layerOutline.destroy();
    diagLine.destroy();
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
      yLeft = SnowProfile.handleMaxY + (SnowProfile.HANDLE_SIZE / 2);
    }
    else {

      // This is not the bottom snow layer, so the Y dimension of the left end
      // is the Y of the handle of the snow layer below this snow layer.
      yLeft = SnowProfile.snowLayers[i + 1].handleGetY() +
        SnowProfile.HANDLE_SIZE / 2;
    }

    // Y dimension of the right end is the Y of the line below the
    // description of this snow layer.
    yRight = SnowProfile.lineBelowY(i);

    // X dimension of the left end is the right edge of the graph
    xLeft = SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH;

    // X dimension of the right end is the left end of the line
    // below the description of this snow layer.
    xRight = SnowProfile.DEPTH_LABEL_WD + 1 +
      SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD - 3;
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

    // Destroy KineticJS objects of this layer
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

    // Update location of KineticJS objects whose position
    // depends on the index of the layer
    SnowProfile.setIndexPositions();
  };

  /**
   * Get or set description of this snow layer
   * @param {Object} [data] - Object describing the snow layer.
   * @returns {Object} Object describing the snow layer if param omitted.
   */
  this.describe = function(data) {

    /**
     * @summary Generate a text description of grain forms from symbols
     * @desc Accept grain form symbols selected by the user, if any, and
     *   return a text description of the form.  The description is
     *   constructed by looking up the symbols in CAAML_SHAPE and
     *   CAAML_SUBSHAPE to find the equivalent text.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @returns {string} Text description of the grain forms
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
     * @summary Generate an icon description for Melt-freeze crust
     * @desc Generate the appropriate Melt-freeze crust icon for the
     *   the specified secondary shape, if any
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container KineticJS.Group object to hold icons
     */
    function sym2iconsMFcr(secondaryShape, secondarySubShape, container) {

      var primaryIcon = new Image();
      var primaryIconKJS;
      var secondaryIcon = new Image();
      var secondaryIconKJS;

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

      // Make a place to hold the Melt-freeze crust icon
      primaryIconKJS = new Kinetic.Image({
        x: 0,
        y: 0,
        image: primaryIcon
      });
      container.add(primaryIconKJS);
      if (secondaryShape === "") {

        // There is no secondary shape so we just use the normal MFcr icon
        primaryIcon.src = "data:image/png;base64," +
          SnowProfile.CAAML_SUBSHAPE.MF.MFcr.icon.image;
        primaryIconKJS.offsetY((SnowProfile.CAAML_SUBSHAPE.MF.MFcr.icon.
          height - SnowProfile.DESCR_HEIGHT) / 2);
      }
      else {

        // There is a secondary shape, so use the alternative MFcr icon
        primaryIcon.src = "data:image/png;base64," + image;
        primaryIconKJS.offsetY((29 - SnowProfile.DESCR_HEIGHT) / 2);
        secondaryIconKJS = new Kinetic.Image({
          x: 0,
          y: 0,
          image: secondaryIcon
        });
        container.add(secondaryIconKJS);
        if (secondarySubShape === "") {
          secondaryIconKJS.offsetY((SnowProfile.CAAML_SHAPE[
            secondaryShape].icon.height - SnowProfile.DESCR_HEIGHT)/2);
          secondaryIconKJS.offsetX((SnowProfile.CAAML_SHAPE[secondaryShape].
            icon.width) / 2 - 38);
          secondaryIcon.src = "data:image/png;base64," +
            SnowProfile.CAAML_SHAPE[secondaryShape].icon.image;
        }
        else {
          secondaryIconKJS.offsetY((SnowProfile.CAAML_SUBSHAPE[
            secondaryShape][secondarySubShape].icon.height-
            SnowProfile.DESCR_HEIGHT)/2);
          secondaryIconKJS.offsetX((SnowProfile.CAAML_SUBSHAPE[secondaryShape][
            secondarySubShape].icon.width) / 2 - 38);
          secondaryIcon.src = "data:image/png;base64," +
            SnowProfile.CAAML_SUBSHAPE[secondaryShape][
            secondarySubShape].icon.image;
        }
      }
    } // function sym2iconsMFcr()

    /**
     * @summary Generate an icon description for normal case
     * @desc  Accept grain form symbols selected by the user, if any, and
     *   return an icon description of the form.  The description is
     *   constructed by looking up the symbols in CAAML_SHAPE and
     *   CAAML_SUBSHAPE to find the equivalent icons.  It has been
     *   determined that the primary subshape is NOT Melt-freeze crust.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container KineticJS.Group object to hold icons
     */
    function sym2iconsNormal(primaryShape, primarySubShape, secondaryShape,
      secondarySubShape, container) {

      var primaryIcon = new Image();
      var primaryIconKJS;
      var secondaryIcon = new Image();
      var secondaryIconKJS;
      var iconCursor = 0;

      if (primaryShape !== "") {
        primaryIconKJS = new Kinetic.Image({
          x: 0,
          y: 0,
          image: primaryIcon
        });
        container.add(primaryIconKJS);

        if (primarySubShape !== "") {

          // Add the icon for the primary grain subshape
          primaryIconKJS.offsetY((SnowProfile.CAAML_SUBSHAPE[
            primaryShape][primarySubShape].icon.height-
            SnowProfile.DESCR_HEIGHT)/2);
          iconCursor = SnowProfile.CAAML_SUBSHAPE[primaryShape][
            primarySubShape].icon.width;
          primaryIcon.src = "data:image/png;base64," +
              SnowProfile.CAAML_SUBSHAPE[primaryShape][
              primarySubShape].icon.image;
        }
        else {

          // Add the icon for the primary grain shape
          primaryIconKJS.offsetY((SnowProfile.CAAML_SHAPE[
            primaryShape].icon.height - SnowProfile.DESCR_HEIGHT)/2);
            iconCursor = SnowProfile.CAAML_SHAPE[primaryShape].icon.width;
            primaryIcon.src = "data:image/png;base64," +
              SnowProfile.CAAML_SHAPE[primaryShape].icon.image;
        }
        if (secondaryShape !== "") {

          // Add left paren to the icons
          iconCursor += 3;
          container.add(new Kinetic.Text({
            text: "(",
            offsetY: 6 - (SnowProfile.DESCR_HEIGHT / 2),
            offsetX: - iconCursor,
            stroke: "000"
          }));
          iconCursor += 7;

          // Add secondary grain shape icon
          secondaryIconKJS = new Kinetic.Image({
            x: 0,
            y: 0,
            image: secondaryIcon
          });
          container.add(secondaryIconKJS);
          if (secondarySubShape === "") {
            secondaryIconKJS.offsetY((SnowProfile.CAAML_SHAPE[
              secondaryShape].icon.height - SnowProfile.DESCR_HEIGHT)/2);
            secondaryIconKJS.offsetX(-iconCursor);
            iconCursor += SnowProfile.CAAML_SHAPE[
              secondaryShape].icon.width;
            secondaryIcon.src = "data:image/png;base64," +
              SnowProfile.CAAML_SHAPE[secondaryShape].icon.image;
          }
          else {
            secondaryIconKJS.offsetY((SnowProfile.CAAML_SUBSHAPE[
              secondaryShape][secondarySubShape].icon.height-
              SnowProfile.DESCR_HEIGHT)/2);
            secondaryIconKJS.offsetX(-iconCursor);
            iconCursor += SnowProfile.CAAML_SUBSHAPE[secondaryShape][
              secondarySubShape].icon.width;
            secondaryIcon.src = "data:image/png;base64," +
              SnowProfile.CAAML_SUBSHAPE[secondaryShape][
              secondarySubShape].icon.image;
          }

          // Add right paren to the icons
          iconCursor += 3;
          container.add(new Kinetic.Text({
            text: ")",
            offsetY: 6 - (SnowProfile.DESCR_HEIGHT / 2),
            offsetX: - iconCursor,
            stroke: "000"
          }));
        }
      }
    } // function sym2iconsNormal()

    /**
     * @summary Generate an icon description of grain forms from symbols
     * @desc Accept grain form symbols selected by the user, if any, and
     *   return an icon description of the form.  The description is
     *   constructed by looking up the symbols in CAAML_SHAPE and
     *   CAAML_SUBSHAPE to find the equivalent icons.   There are two
     *   cases:
     *   1) If the primary subshape is Melt-freeze crust, then the
     *      secondary shape is incorporated into the MFcr icon.
     *   2) In all other cases, the secondary shape in parentheses follows
     *      the primary shape.
     * @param {string} primaryShape Primary grain shape symbol
     * @param {string} primarySubShape Primary grain subshape symbol
     * @param {string} secondaryShape Secondary grain shape symbol
     * @param {string} secondarySubShape Secondary grain subshape symbol
     * @param {Object} container KineticJS.Group object to hold icons
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

    if (data === undefined) {

      // Called with no argument, return an object with the values
      return {
        primaryGrainShape: primaryGrainShape,
        primaryGrainSubShape: primaryGrainSubShape,
        secondaryGrainShape: secondaryGrainShape,
        secondaryGrainSubShape: secondaryGrainSubShape,
        grainSize: grainSize,
//        lwc: lwc,
        comment: comment,
        layer: self,
        numLayers: SnowProfile.snowLayers.length
      };
    }
    else {

      // Called with an argument so set values for layer
      primaryGrainShape = data.primaryGrainShape;
      primaryGrainSubShape = data.primaryGrainSubShape;
      secondaryGrainShape = data.secondaryGrainShape;
      secondaryGrainSubShape = data.secondaryGrainSubShape;
      grainSize = data.grainSize;

      // Empty the icon group and text description
      grainSizeText.setText("");
      grainIcons.destroyChildren();

      if ((primaryGrainShape !== "") ||
        (grainSize !== "")) {

        // Build a text description from what we have
        var text = sym2text(primaryGrainShape, primaryGrainSubShape,
          secondaryGrainShape, secondaryGrainSubShape);

        // Build an iconic description from what we have
        sym2icons(primaryGrainShape, primaryGrainSubShape,
          secondaryGrainShape, secondaryGrainSubShape, grainIcons);
        }

        // Show the grain size
        if (grainSize !== "") {

          // Grain size information is available.
          grainSizeText.setText(SnowProfile.CAAML_SIZE[grainSize]);
        }
      }

      // // Liquid water content description.
      // lwc = data.lwc;
      // if (lwc === "") {
      //   LWCDescr.setText("");
      // }
      // else {
      //   LWCDescr.setText(SnowProfile.CAAML_LWC[lwc]);
      // }

      // Comment description
      comment = data.comment;
      if (comment === "") {
        commentDescr.setText("");
      }
      else {
        commentDescr.setText(comment);
      }

      // Re-draw the diagram with the updated information
      self.draw();
  };

  /**
   Return the current X position of the handle
   @returns {number}
   */
  this.handleGetX = function() {
    return handle.getX();
  };

  /**
   Return the current Y position of the handle
   @returns {number}
   */
  this.handleGetY = function() {
    return handle.getY();
  };

  /**
   * Set position and length of the diagonal line at bottom of this layer
   *
   */
  this.setDiagLine = function() {
    diagLine.setPoints(diagLinePts());
  };

  /**
   * Set coordinates of the layer outline
   */
  this.setLayerOutline = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    var x = handle.getX();
    var yTop = handle.getY() +  (SnowProfile.HANDLE_SIZE / 2);
    var yBottom = SnowProfile.HANDLE_SIZE / 2;
    if (i === (numLayers - 1)) {

      // This is the bottom layer so bottom Y is bottom of graph
      yBottom += SnowProfile.handleMaxY;
    }
    else {

      // Not the bottom layer so bottom Y is top of next lower layer
      yBottom += SnowProfile.snowLayers[i+1].handleGetY();
    }
    layerOutline.width(x - SnowProfile.DEPTH_LABEL_WD - 1);
    layerOutline.y(yTop);
    layerOutline.height(yBottom - yTop);
  };

  /**
    @summary Draw this layer from depth and hardness values and adjacent layers.
    @desc Redraw as necessary to respond to movement of the handle at the
      top of this layer.
    @callback SnowProfile.Layer#draw
   */
  this.draw = function() {
    var i = self.getIndex();

    // Set handle X from hardness
    handle.setX(self.code2x(hardness));

    // Set handle Y from depth
    handle.setY(SnowProfile.depth2y(depthVal));

    // Adjust the rectangle that outlines this layer
    self.setLayerOutline();

    // Adjust the diagonal line to the description area
    self.setDiagLine();

    // Adjust the outline of the layer above, if any
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setLayerOutline();
    }
    SnowProfile.kineticJSLayer.batchDraw();
  }; // this.draw = function() {

  /**
   * @summary Push this layer down to make room to insert a layer above.
   * @desc Add an increment to the depth of this layer and all layers below
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
      if (spaceBelow < (2 * SnowProfile.INS_INCR)) {

        // Not enough so we need to make space below this snow layer.
        SnowProfile.snowLayers[i + 1].pushDown();
      }
    }

    // Add the insertion increment to this layer
    depthVal += SnowProfile.INS_INCR;
    self.draw();
  };

  /**
   Set handle visibility, if it is untouched
   @param {boolean} visible Make the handle visible?
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
    SnowProfile.kineticJSLayer.batchDraw();
  };

  /**
   Set the Y position of those parts of the layer whose Y position
   depends on the index of the snow layer in snowpack not its depth.
   This is needed when a layer is inserted or deleted.
   */
  this.setIndexPosition = function() {
    var i = self.getIndex();
    grainSizeText.y(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    grainIcons.y(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + //3 +
      (i * SnowProfile.DESCR_HEIGHT));
    // LWCDescr.y(SnowProfile.HANDLE_MIN_Y +
    //   (SnowProfile.HANDLE_SIZE / 2) + 3 +
    //     (i * SnowProfile.DESCR_HEIGHT));
    commentDescr.y(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    lineBelow.setPoints([SnowProfile.DEPTH_LABEL_WD + 1 +
      SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD - 3,
      SnowProfile.lineBelowY(i), SnowProfile.STAGE_WD - 3,
      SnowProfile.lineBelowY(i)]);
    diagLine.setPoints(diagLinePts());
    editButton.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) +
      (SnowProfile.DESCR_HEIGHT / 2) + (i * SnowProfile.DESCR_HEIGHT));
    insertButton.setY(SnowProfile.lineBelowY(i));
    // If this is not the top snow layer, update the diagonal line
    // owned by the snow layer above.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setDiagLine();
    }
  };

  // Add KineticJS objects to the KineticJS layer
  SnowProfile.kineticJSLayer.add(grainSizeText);
  SnowProfile.kineticJSLayer.add(grainIcons);
//  SnowProfile.kineticJSLayer.add(LWCDescr);
  SnowProfile.kineticJSLayer.add(commentDescr);
  SnowProfile.kineticJSLayer.add(lineBelow);
  SnowProfile.kineticJSLayer.add(handleLoc);
  SnowProfile.kineticJSLayer.add(layerOutline);
  SnowProfile.kineticJSLayer.add(handle);
  SnowProfile.kineticJSLayer.add(diagLine);

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
      if (spaceBelow < SnowProfile.INS_INCR) {

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
   Style the cursor for the handle
   @callback
   */
  handle.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
  });

  /**
   Style the cursor for the handle
   @callback
   */
  handle.on('mouseout', function() {
    handleLoc.setVisible(0);
    SnowProfile.kineticJSLayer.batchDraw();
    document.body.style.cursor = 'default';
  });

  /**
   When the handle is in use, show its location to the right.
   @callback
   */
  handle.on('mousedown', function() {
    handleLoc.setVisible(1);
    handleTouched = true;
    SnowProfile.kineticJSLayer.batchDraw();
  });

  /**
   When the mouse releases the handle, stop showing its location.
   @callback
   */
  handle.on('mouseup', function() {
    handleLoc.setVisible(0);
    SnowProfile.kineticJSLayer.batchDraw();
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
        if (spaceBelow < ( 2 * SnowProfile.INS_INCR)) {

          // Not enough so we need to make space below this snow layer.
          SnowProfile.snowLayers[i + 1].pushDown();
          SnowProfile.snowLayers[i + 1].pushDown();
        }
      }
      new SnowProfile.Layer(depthVal + SnowProfile.INS_INCR);
    }
  });

  /**
   When the handle moves, recalculate the hardness value displayed
   and draw the lines connected to the handle
   @callback
   */
  handle.on('dragmove', function() {

    var i = self.getIndex();

    // Adjust the horizontal (hardness) position
    hardness = self.x2code(handle.getX());
    self.setLayerOutline();

    // Adjust the vertical (depth) position
    depthVal = self.y2depth(handle.getY());

    // Set the text information floating to the right of the graph
    var mm;
    if (SnowProfile.depthRef === "s") {

       // Depth is referred to the snow surface
       mm = Math.round(depthVal * 10) / 10;
    }
    else {

      // Depth is referred to the ground
      mm = Math.round((SnowProfile.totalDepth - depthVal) * 10) / 10;
    }
    handleLoc.setText( '(' + mm + ', ' +
      self.x2code(handle.getX()) + ')');
    handleLoc.setY(SnowProfile.depth2y(depthVal));

    // If this is not the top snow layer, update the diagonal line
    // owned by the snow layer above.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setDiagLine();
    }

    // Draw the layer
    self.draw();
  }); // handle.on('dragmove', function() {

  // Draw the layer
  self.draw();

  // Set the location of KineticJS objects dependent on index of layer
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
  var x = SnowProfile.HANDLE_MIN_X;
  if (code !== null) {
    for (var i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      if (code === SnowProfile.CAAML_HARD[i][0]) {
        x = SnowProfile.CAAML_HARD[i][2] + SnowProfile.HARD_BAND_WD * 0.5;
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
    if ((x >= (SnowProfile.CAAML_HARD[i][2]) &&
         (x < (SnowProfile.CAAML_HARD[i+1][2])))) {
      code = SnowProfile.CAAML_HARD[i][0];
      break;
    }
  }
  return code;
};

/**
 Convert a Y axis position to a depth in cm.
 @param {number} y Y axis position.
 @return {number} Depth of this layer in cm.
 */
SnowProfile.Layer.prototype.y2depth = function(y) {
  "use strict";
  return (y - SnowProfile.HANDLE_MIN_Y) / SnowProfile.DEPTH_SCALE;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
