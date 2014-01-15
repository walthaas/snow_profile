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
SnowProfile.Layer = function(depth) {
  "use strict";

  // Reference this object inside an event handler
  var self = this;

  // Insert this Layer in the appropriate place in the snow pack.
  var i,
    numLayers = SnowProfile.snowLayers.length,
    inserted = false;

  /**
   Depth of the top of this SnowProfileLayer in cm from the snow surface.
   @type {number}
   */
  this.depth = depth;

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
   Return depth in cm of this snow layer
   @returns {number} Depth of top of this layer in cm below surface
   */
  this.getDepth = function() {
    return self.depth;
  };

  /**
   Get index of this object in snowLayers[]
   @returns {number} Integer index into snowLayers[]
   */
  function getIndex() {
    var i;
    var numLayers = SnowProfile.snowLayers.length;
    for (i = 0; i < numLayers; i++) {
      if (SnowProfile.snowLayers[i] === self) {
        return i;
      }
    }
    console.error("Object not found in snowLayers[]");
    console.debug("i=%d  numLayers=%d  snowLayers=%o", i, numLayers,
      SnowProfile.snowLayers );
  };

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

  // Insert this layer above the first layer that is deeper
  for (i = 0; i<numLayers; i++) {
    if (SnowProfile.snowLayers[i].getDepth() >= depth) {
      SnowProfile.snowLayers.splice(i, 0, this);
      break;
    }
  }

  // If no deeper layer was found, add this layer at the bottom.
  // This also handles the initial case where there were no layers.
  if (!inserted) {
    SnowProfile.snowLayers.push(this);
  }

  /**
   Add text for the grain description
   @type {Object}
   */
  var grainDescr = new Kinetic.Text({
    width: SnowProfile.GRAIN_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.GRAIN_LEFT
  });
  SnowProfile.kineticJSLayer.add(grainDescr);

  /**
   Add text for the liquid water content
   @type {Object}
   */
  var LWCDescr = new Kinetic.Text({
    width: SnowProfile.LWC_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.LWC_LEFT
  });
  SnowProfile.kineticJSLayer.add(LWCDescr);

  /**
   Add text for the comment
   @type {Object}
   */
  var commentDescr = new Kinetic.Text({
    width: SnowProfile.COMMENT_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left',
    x: SnowProfile.COMMENT_LEFT
  });
  SnowProfile.kineticJSLayer.add(commentDescr);

  /**
   Add a horizontal line below the description
   @type {Object}
   */
  var lineBelow = new Kinetic.Line({
    points: [0, 0, 0, 0],
    stroke: SnowProfile.GRID_COLOR,
    strokeWidth: 1
  });
  SnowProfile.kineticJSLayer.add(lineBelow);
  SnowProfile.updateBottomDiag();

  /**
   Handle for the line at the top of the layer.

   The user drags and drops this handle to adjust depth and hardness.
   @type {Object}
   */
  var handle = new Kinetic.Rect({
    x: SnowProfile.HANDLE_MIN_X,
    y: self.depth2y(self.depth),
    width: SnowProfile.HANDLE_SIZE,
    height: SnowProfile.HANDLE_SIZE,
    offsetX: SnowProfile.HANDLE_SIZE / 2,
    fill: '#000',
    draggable: true,
    dragBoundFunc: function(pos) {

      // X (hardness) position is bound by the edges of the graph.
      var newX = pos.x;
      if (pos.x < SnowProfile.HANDLE_MIN_X) {
        newX = SnowProfile.HANDLE_MIN_X;
      }
      else if (pos.x > SnowProfile.HANDLE_MAX_X) {
        newX = SnowProfile.HANDLE_MAX_X;
      }

      // Y (depth) position is limited by the depth of the snow layers
      // above and below in the snow pack, or by air and ground.
      var newY = pos.y;
      var i = getIndex();
      var numLayers = SnowProfile.snowLayers.length;
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
      self.depth = self.y2depth(newY);
      return {
        x: newX,
        y: newY
      };
    }
  }); // handle = new Kinetic.Rect({

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", function(evt) {
      handleInvisible();
  });

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", function(evt) {
    handleVisible();
  });

  /**
   Make the handle visible
   */
  function handleVisible() {
    handle.setVisible(true);
    self.draw();
  };

  /**
    Make the handle invisible
   */
  function handleInvisible() {
    handle.setVisible(false);
    self.draw();
  };

  /**
   * Delete this layer and make necessary adjustments
   */
  this.delete = function() {

    // Remove this Layer from the snowLayers array
    SnowProfile.snowLayers.splice(i, 1);

    // Destroy KineticJS objects of this layer
    self.destroy();

    // If the layer we just removed was not the top layer,
    // tell the layer above to adjust itself.
    if (i > 0) {
      SnowProfile.snowLayers[i-1].draw();
    }
    else {

      // We just removed the top layer.  The layer that was
      // below it is the new top layer so set its depth.
      SnowProfile.snowLayers[0].setDepth(0);
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

    // Update the diagonal line from the lower right corner
    // of the graph to the horizontal line below the
    // description of the lowest layer to reflect the fact
    // that the number of layers has changed.
    SnowProfile.updateBottomDiag();
  };

  /**
   Remove and destroy all KineticJS objects belonging to this snow layer
   */
  this.destroy = function() {
    handle.off('mouseup mousedown dragmove mouseover mouseout');
    handle.destroy();
    grainDescr.destroy();
    LWCDescr.destroy();
    commentDescr.destroy();
    lineBelow.destroy();
    handleLoc.destroy();
    self.horizLine.destroy();
    self.vertLine.destroy();
    self.diagLine.destroy();
    editButton.destroy();
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
   Add text to show current handle location.
   */
  var handleLoc = new Kinetic.Text({
    x: SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 10,
    y: self.depth2y(self.depth),
    fontSize: 12,
    fontStyle: 'bold',
    fontFamily: 'sans-serif',
    fill: SnowProfile.LABEL_COLOR,
    align: 'left',
    visible: 0
  });
  SnowProfile.kineticJSLayer.add(handleLoc);

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
  SnowProfile.kineticJSLayer.add(handle);

  /**
   Define end points of horizontal line from the Y axis to the handle.

   The horizontal line extends from the left edge of the graph right to
   the maximum of (X of SnowProfile, X of snow layer above).
   @returns {number[]} Two-dimensional array of numbers of the starting and
   ending points for the horizontal line.
   */
  this.horizLinePts = function() {
    var x = handle.getX();
    var i = getIndex();
console.debug("horizLinePts() finds i=%d", i);
    if (i !== 0) {
      x = Math.max(x, SnowProfile.snowLayers[i-1].handleGetX());
    }
    return  [
      [SnowProfile.DEPTH_LABEL_WD + 1,
        self.depth2y(self.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)],
      [x,
        self.depth2y(self.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)]
    ];
  }; // this.horizLinePts = function() {

  /**
   Define a horizontal line at the top of the layer.
   @type {Object}
   */
  this.horizLine = new Kinetic.Line({
    points: self.horizLinePts(),
    stroke: '#000'
  });
  SnowProfile.kineticJSLayer.add(this.horizLine);

  /**
   Define end points of a vertical line from the handle down to the top of
   the layer below in the snow pack, or the graph bottom if this is lowest
   layer.
   @returns {number[]} Two-dimensional array of numbers of the starting
   and ending points for the vertical line.
   */
  this.vertLinePts = function() {
    var x = handle.getX();
    var topY = handle.getY() + (SnowProfile.HANDLE_SIZE / 2);
    var bottomY = SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2);
    var i = getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // If this layer is not the lowest layer in the snowpack, bottom
    // Y is the top of the layer below.
    if (i !== numLayers - 1) {
      bottomY = SnowProfile.snowLayers[i + 1].handleGetY() +
        SnowProfile.HANDLE_SIZE / 2;
    }
    return [[x, topY],[x, bottomY]];
  }; // this.vertLinePts = function() {

  /**
   Define a vertical line from the handle down to the top of the layer
   below, or graph bottom if this is the lowest layer.
   @type {Object}
   */
  this.vertLine = new Kinetic.Line({
    points: self.vertLinePts(),
    stroke: '#000'
  });
  SnowProfile.kineticJSLayer.add(this.vertLine);

  /**
   Define end points of a diagonal line from the handle of the layer below
   this layer to the line below the description of this layer.
   @returns {number[]} Two-dimensional array of numbers of the starting
   and ending points for the diagonal line.
   */
  this.diagLinePts = function() {
    var i = getIndex();
    var xLeft,
    yLeft,
    xRight,
    yRight,
    points;

    // Y dimension of the left end is the Y of the handle.
    if (i === 0) {
      yLeft = yRight = SnowProfile.HANDLE_MIN_Y +
        (SnowProfile.HANDLE_SIZE / 2);
    }
    else {
      yLeft = handle.getY() + SnowProfile.HANDLE_SIZE / 2;
      yRight = SnowProfile.lineBelowY(i - 1);
    }

    // x dimension of the left end is the right edge of the graph
    xLeft = SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH;
    xRight = SnowProfile.DEPTH_LABEL_WD + 1 +
      SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD - 3;
    points = [[xLeft, yLeft], [xRight, yRight]];
    return points;
  }; // this.diagLinePts = function() {

  /**
   Define a diagonal line from the handle right to the top of the
   row of buttons that control the layer
   @todo Don't want this for the top layer.
   @type {Object}
   */
  this.diagLine = new Kinetic.Line({
    points: self.diagLinePts(),
    stroke: SnowProfile.GRID_COLOR,
    strokeWidth: 1
  });
  SnowProfile.kineticJSLayer.add(this.diagLine);

  /**
   Describe the snow layer
   @param {Object} [data] - Object describing the snow layer.
   @returns {Object} Object describing the snow layer.
   */
  this.describe = function(data) {
    if (data) {

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
    else {

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
  };

  /**
   Create the "Edit" button and listen for clicks on it
   @type {Object}
   */
  var editButton = new SnowProfile.Button("Edit");

  // Edit button clicked so pop up a modal dialog form
  $(document).bind("SnowProfileButtonClick", function(evt, extra) {
    if (extra.buttonObj === editButton) {
      SnowProfile.PopUp(self.describe());
    }
  });

  /**
   Draw this layer from depth and hardness values and adjacent layers.

   This function redraws as necessary to respond to movement of the
   handle at the top of this layer.
   */
  this.draw = function() {
    var i = getIndex();
    var numLayers = SnowProfile.snowLayers.length;
    console.debug("draw finds i=%d numLayers=%d", i, numLayers);
    // Set handle X from hardness
    handle.setX(self.code2x(hardness));

    // Set handle Y from depth
    handle.setY(self.depth2y(self.depth));

    // Adjust the horizontal line defining this layer
    self.horizLine.setPoints(self.horizLinePts());

    // Adjust the vertical line defining this layer
    self.vertLine.setPoints(self.vertLinePts());

    // Adjust the diagonal line to the description area
    self.diagLine.setPoints(self.diagLinePts());

    // Adjust the horizontal line of the layer below, if any.
    // That line should extend to its own handle or to the vertical line
    // dropping from the handle of this layer, whichever is greater.
    if (i !== (numLayers - 1)) {
      SnowProfile.snowLayers[i + 1].horizLine.setPoints(
        SnowProfile.snowLayers[i + 1].horizLinePts());
    }

    // Adjust the vertical line of the layer above, if any
    // That line should extend to the top of this layer.
    if (i !== 0) {
      SnowProfile.snowLayers[i - 1].vertLine.setPoints(
        SnowProfile.snowLayers[i - 1].vertLinePts());
    }
    SnowProfile.stage.draw();
  }; // this.draw = function() {

  /**
   Push this layer down to make room to insert a layer above

   Add an increment to the depth of this layer and all layers below
   to the bottom
   */
  this.pushDown = function() {
    var i = getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // Is this the bottom layer?
    if (i !== (numLayers - 1)) {

      // This isn't the bottom layer so push the layer below down
      SnowProfile.snowLayers[i + 1].pushDown();
    }

    // Add the insertion increment to this layer
    self.depth += SnowProfile.INS_INCR;
    self.draw();
  }; // this.pushDown = function() {

  /**
   Set the depth of the layer and draw.
   @param {number} depth Depth in centimeters of the top of this layer.
   */
  this.setDepth = function(depth) {
    self.depth = depth;
    self.draw();
  };

  /**
   Set handle visibility, if it is untouched
   @param {boolean} visible Make the handle visible?
   */
  this.setHandleVisible = function(visible) {
    if (!handleTouched) {

      // The user hasn't this handle since it was inited, so blink
      handle.setStroke(visible ? "#000" : "#FFF");
    }
    else {

      // The user has touched the handle so make it always visible
      handle.setStroke("#000");
    }
    SnowProfile.stage.draw();
  }; // this.setHandleVisible = function(visible) {

  /**
   When the handle moves, recalculate the hardness value displayed
   and draw the lines connected to the handle
   @callback
   */
  handle.on('dragmove', function() {

    // Adjust the horizontal (hardness) position
    hardness = self.x2code(handle.getX());
    self.horizLine.setPoints(self.horizLinePts());

    // Adjust the vertical (depth) position
    self.depth = self.y2depth(handle.getY());

    // Set the text information floating to the right of the graph
    var mm = Math.round(self.depth * 10) / 10;
    handleLoc.setText( '(' + mm + ', ' +
      self.x2code(handle.getX()) + ')');
    handleLoc.setY(self.depth2y(self.depth));

    // Draw the layer
    self.draw();
  }); // handle.on('dragmove', function() {

  /**
   Set the Y position of those parts of the layer whose Y position
   depends on the index of the snow layer in snowpack not its depth.
   This is needed when a layer is inserted or deleted.
   */
  this.setIndexPosition = function() {
    var i = getIndex();
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
  };

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
SnowProfile.Layer.prototype.depth2y = function(depth) {
  "use strict";
  return (depth * (SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH)) +
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
