/**
 @file Define the object that describes a snow layer
 @copyright Walt Haas <haas@xmission.com>
 @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
 Object describing a single snow stratigraphy layer.
 @param {number} depth Initial depth in cm of this layer from the top
 of the snow pack.
 @constructor
 */
SnowProfile.Layer = function(depthArg) {
  "use strict";

  // Reference this object inside an event handler
  var self = this;

  // Insert this Layer in the appropriate place in the snow pack.
  var i,
    numLayers = SnowProfile.snowLayers.length,
    inserted = false;

  /**
   * Depth of the top of this SnowProfileLayer in cm from the snow surface.
   * Initialized to the constructor parameter.
   * @type {number}
   */
  var depthVal = depthArg;

  /**
   Grain shape of this layer
   @type {string}
   */
  var grainShape = "";

  /**
   Grain size of this snow layer
   @type {string}
   */
  var grainSize = "";

  /**
   Liquid water content of this snow layer
   @type {string}
   */
  var lwc = "";

  /**
   User's comment about this snow layer
   @type {string}
   */
  var comment = "";

  /**
   Has the user touched the handle since this layer was created?

   Used to make an untouched handle throb visibly, to draw the user's
   attention to the need to set the handle position.
   @type {boolean}
   */
  var handleTouched = false;

  /**
   Hardness of this snow layer.

   A string code from the SnowProfile.CAAML_HARD table above.
   Initial null means the handle is untouched.
   @type {string}
   */
  var hardness = null;

  /**
   * Text for the grain description
   * @type {Object}
   */
  var grainDescr = new Kinetic.Text({
    width: SnowProfile.GRAIN_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.GRAIN_LEFT
  });

  /**
   * Text for the liquid water content
   * @type {Object}
   */
  var LWCDescr = new Kinetic.Text({
    width: SnowProfile.LWC_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.LWC_LEFT
  });

  /**
   * Text for the comment
   * @type {Object}
   */
  var commentDescr = new Kinetic.Text({
    width: SnowProfile.COMMENT_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.COMMENT_LEFT
  });

  /**
   * Horizontal line below the description
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
    y: self.depth2y(depthVal),
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
        if (pos.y > (SnowProfile.HANDLE_MAX_Y)) {
          newY = SnowProfile.HANDLE_MAX_Y;
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
    y: self.depth2y(depthVal),
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
   * Define a horizontal line at the top of the layer.
   * @type {Object}
   */
  var horizLine = new Kinetic.Line({
    points: [0, 0, 0, 0],
    stroke: '#000'
  });

  /**
   Define a vertical line from the handle down to the top of the layer
   below, or graph bottom if this is the lowest layer.
   @type {Object}
   */
  var vertLine = new Kinetic.Line({
    points: [0, 0, 0, 0],
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
  }

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
    handle.destroy();
    grainDescr.destroy();
    LWCDescr.destroy();
    commentDescr.destroy();
    lineBelow.destroy();
    handleLoc.destroy();
    horizLine.destroy();
    vertLine.destroy();
    diagLine.destroy();
    editButton.destroy();
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
      yLeft = SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2);
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
    points = [[xLeft, yLeft], [xRight, yRight]];
    return points;
  }

  /**
   * Define end points of horizontal line from the Y axis to the handle.
   *
   * The horizontal line extends from the left edge of the graph right to
   * the maximum of (X of SnowProfile, X of snow layer above).
   * @returns {number[]} Two-dimensional array of numbers of the starting and
   * ending points for the horizontal line.
   */
  function horizLinePts() {
    var x = handle.getX();
    var i = self.getIndex();
    if (i !== 0) {
      x = Math.max(x, SnowProfile.snowLayers[i-1].handleGetX());
    }
    return  [
      [SnowProfile.DEPTH_LABEL_WD + 1,
        self.depth2y(depthVal) + Math.floor(SnowProfile.HANDLE_SIZE / 2)],
      [x,
        self.depth2y(depthVal) + Math.floor(SnowProfile.HANDLE_SIZE / 2)]
    ];
  }

  /**
   Define end points of a vertical line from the handle down to the top of
   the layer below in the snow pack, or the graph bottom if this is lowest
   layer.
   @returns {number[]} Two-dimensional array of numbers of the starting
   and ending points for the vertical line.
   */
   function vertLinePts() {
    var x = handle.getX();
    var topY = handle.getY() + (SnowProfile.HANDLE_SIZE / 2);
    var bottomY = SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2);
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // If this layer is not the lowest layer in the snowpack, bottom
    // Y is the top of the layer below.
    if (i !== numLayers - 1) {
      bottomY = SnowProfile.snowLayers[i + 1].handleGetY() +
        SnowProfile.HANDLE_SIZE / 2;
    }
    return [[x, topY],[x, bottomY]];
  }

  /**
   * Delete this layer and make necessary adjustments
   */
  this.deleteLayer = function() {

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
    if (data === undefined) {

      // Called with no argument, return an object with the values
      return {
        grainShape: grainShape,
        grainSize: grainSize,
        lwc: lwc,
        comment: comment,
        layer: self,
        numLayers: SnowProfile.snowLayers.length
      };
    }
    else {

      // Called with an argument so set values for layer
      grainShape = data.grainShape;
      grainSize = data.grainSize;
      if ((grainShape === "") &&
        (grainSize === "")) {

        // No information about grains
        grainDescr.setText("");
      }
      else {

        // Build a text description from what we have
        var text = "";
        if (grainShape !== "") {
          text += SnowProfile.CAAML_SHAPE[grainShape] +
            "\nsome second line\n";
        }
        if (grainSize !== "") {
          text += SnowProfile.CAAML_SIZE[grainSize];
        }
        grainDescr.setText(text);
      }

      // Liquid water content description
      lwc = data.lwc;
      if (lwc === "") {
        LWCDescr.setText("");
      }
      else {
        LWCDescr.setText(SnowProfile.CAAML_LWC[lwc]);
      }

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
    }
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
   * Set position and length of the horizontal line at top of this layer
   *
   */
  this.setHorizLine = function() {
    horizLine.setPoints(horizLinePts());
  };

  /**
   * Set position and length of the vertical line at right side of this layer
   *
   */
  this.setVertLine = function() {
    vertLine.setPoints(vertLinePts());
  };

  /**
   Draw this layer from depth and hardness values and adjacent layers.

   This function redraws as necessary to respond to movement of the
   handle at the top of this layer.
   */
  this.draw = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // Set handle X from hardness
    handle.setX(self.code2x(hardness));

    // Set handle Y from depth
    handle.setY(self.depth2y(depthVal));

    // Adjust the horizontal line defining this layer
    self.setHorizLine();

    // Adjust the vertical line defining this layer
    self.setVertLine();

    // Adjust the diagonal line to the description area
    self.setDiagLine();

    // Adjust the horizontal line of the layer below, if any.
    // That line should extend to its own handle or to the vertical line
    // dropping from the handle of this layer, whichever is greater.
    if (i !== (numLayers - 1)) {
      SnowProfile.snowLayers[i + 1].setHorizLine();
    }

    // Adjust the vertical line of the layer above, if any
    // That line should extend to the top of this layer.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setVertLine();
    }
    SnowProfile.stage.draw();
  }; // this.draw = function() {

  /**
   Push this layer down to make room to insert a layer above

   Add an increment to the depth of this layer and all layers below
   to the bottom
   */
  this.pushDown = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // Is this the bottom layer?
    if (i !== (numLayers - 1)) {

      // This isn't the bottom layer so push the layer below down
      SnowProfile.snowLayers[i + 1].pushDown();
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
    SnowProfile.stage.draw();
  };

  /**
   Set the Y position of those parts of the layer whose Y position
   depends on the index of the snow layer in snowpack not its depth.
   This is needed when a layer is inserted or deleted.
   */
  this.setIndexPosition = function() {
    var i = self.getIndex();
    grainDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    LWCDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    commentDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    lineBelow.setPoints([
      [SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 1 +
        SnowProfile.CTRLS_WD - 3, SnowProfile.lineBelowY(i)],
      [SnowProfile.STAGE_WD - 3, SnowProfile.lineBelowY(i)]
    ]);
    editButton.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) +
      (SnowProfile.DESCR_HEIGHT / 2) + (i * SnowProfile.DESCR_HEIGHT));

    // If this is not the top snow layer, update the diagonal line
    // owned by the snow layer above.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].setDiagLine();
    }
  }

  // Add KineticJS objects to the KineticJS layer
  SnowProfile.kineticJSLayer.add(grainDescr);
  SnowProfile.kineticJSLayer.add(LWCDescr);
  SnowProfile.kineticJSLayer.add(commentDescr);
  SnowProfile.kineticJSLayer.add(lineBelow);
  SnowProfile.kineticJSLayer.add(handleLoc);
  SnowProfile.kineticJSLayer.add(horizLine);
  SnowProfile.kineticJSLayer.add(vertLine);
  SnowProfile.kineticJSLayer.add(handle);
  SnowProfile.kineticJSLayer.add(diagLine);

  // Insert this layer above the first layer that is deeper
  for (i = 0; i<numLayers; i++) {
    if (SnowProfile.snowLayers[i].depth() >= depthVal) {
      SnowProfile.snowLayers.splice(i, 0, this);
      break;
    }
  }

  // If no deeper layer was found, add this layer at the bottom.
  // This also handles the initial case where there were no layers.
  if (!inserted) {
    SnowProfile.snowLayers.push(this);
  }

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", handleInvisible);

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", handleVisible);

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
    SnowProfile.stage.draw();
    document.body.style.cursor = 'default';
  });

  /**
   When the handle is in use, show its location to the right.
   @callback
   */
  handle.on('mousedown', function() {
    handleLoc.setVisible(1);
    handleTouched = true;
    SnowProfile.stage.draw();
  });

  /**
   When the mouse releases the handle, stop showing its location.
   @callback
   */
  handle.on('mouseup', function() {
    handleLoc.setVisible(0);
    SnowProfile.stage.draw();
  });

  // When Edit button clicked, pop up a modal dialog form
  $(document).bind("SnowProfileButtonClick", function(evt, extra) {
    if (extra.buttonObj === editButton) {
      SnowProfile.PopUp(self.describe());
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
    self.setHorizLine();

    // Adjust the vertical (depth) position
    depthVal = self.y2depth(handle.getY());

    // Set the text information floating to the right of the graph
    var mm = Math.round(depthVal * 10) / 10;
    handleLoc.setText( '(' + mm + ', ' +
      self.x2code(handle.getX()) + ')');
    handleLoc.setY(self.depth2y(depthVal));

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
 Convert a depth in cm to a Y axis position.
 @param {number} depth Depth of the top of this layer in cm.
 @returns {number} Y position of the layer.
 */
SnowProfile.Layer.prototype.depth2y = function(depthArg) {
  "use strict";
  return (depthArg * (SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH)) +
    SnowProfile.HANDLE_MIN_Y;
};

/**
 Convert a Y axis position to a depth in cm.
 @param {number} y Y axis position.
 @return {number} Depth of this layer in cm.
 */
SnowProfile.Layer.prototype.y2depth = function(y) {
  "use strict";
  return ((y - SnowProfile.HANDLE_MIN_Y) / SnowProfile.GRAPH_HEIGHT) *
    SnowProfile.MAX_DEPTH;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
