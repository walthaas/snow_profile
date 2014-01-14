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
  this.grainShape = null;

  /**
   Grain size of this snow layer
   @type {string}
   */
  this.grainSize = null;

  /**
   Liquid water content of this snow layer
   @type {string}
   */
  this.lwc = null;

  /**
   User's comment about this snow layer
   @type {string}
   */
  this.comment = null;

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
   Has the user touched the handle since this layer was created?

   Used to make an untouched handle throb visibly, to draw the user's
   attention to the need to set the handle position.
   @type {boolean}
   */
  this.handleTouched = false;

  /**
   Hardness of this snow layer.

   A string code from the SnowProfile.CAAML_HARD table above.
   Initial null means the handle is untouched.
   @type {string}
   */
  this.hardness = null;

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
  this.grainDescr = new Kinetic.Text({
    width: SnowProfile.GRAIN_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left'
  });
  SnowProfile.kineticJSLayer.add(this.grainDescr);

  /**
   Add text for the liquid water content
   @type {Object}
   */
  this.LWCDescr = new Kinetic.Text({
    width: SnowProfile.LWC_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left'
  });
  SnowProfile.kineticJSLayer.add(this.LWCDescr);

  /**
   Add text for the comment
   @type {Object}
   */
  this.commentDescr = new Kinetic.Text({
    width: SnowProfile.COMMENT_WD,
    fontSize: 12,
    fontFamily: 'sans-serif',
    fill: "#000",
    align: 'left'
  });
  SnowProfile.kineticJSLayer.add(this.commentDescr);

  /**
   Add a horizontal line below the description
   @type {Object}
   */
  this.lineBelow = new Kinetic.Line({
    points: [0, 0, 0, 0],
    stroke: SnowProfile.GRID_COLOR,
    strokeWidth: 1
  });
  SnowProfile.kineticJSLayer.add(this.lineBelow);
  SnowProfile.updateBottomDiag();

  /**
   Handle for the line at the top of the layer.

   The user drags and drops this handle to adjust depth and hardness.
   @type {Object}
   */
  this.handle = new Kinetic.Rect({
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
      var i = self.getIndex();
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
  }); // this.handle = new Kinetic.Rect({

  // Listen for "SnowProfileHideControls" events
  $(document).bind("SnowProfileHideControls", function(evt) {
      self.handleInvisible();
  });

  // Listen for "SnowProfileShowControls" events
  $(document).bind("SnowProfileShowControls", function(evt) {
    self.handleVisible();
  });

  /**
   Make the handle visible
   */
  this.handleVisible = function() {
    self.handle.setVisible(true);
    self.draw();
  };

  /**
   Make the handle invisible
   */
  this.handleInvisible = function() {
    self.handle.setVisible(false);
    self.draw();
  };

  /**
   Remove and destroy all KineticJS objects belonging to this snow layer
   */
  this.destroy = function() {
    self.handle.off('mouseup mousedown dragmove mouseover mouseout');
    self.handle.destroy();
    self.grainDescr.destroy();
    self.LWCDescr.destroy();
    self.commentDescr.destroy();
    self.lineBelow.destroy();
    self.handleLoc.destroy();
    self.horizLine.destroy();
    self.vertLine.destroy();
    self.diagLine.destroy();
    self.editButton.destroy();
  };

  /**
   Return the current X position of the handle
   @returns {number}
   */
  this.handleGetX = function() {
    return self.handle.getX();
  };

  /**
   Return the current Y position of the handle
   @returns {number}
   */
  this.handleGetY = function() {
    return self.handle.getY();
  };

  /**
   Add text to show current handle location.
   */
  this.handleLoc = new Kinetic.Text({
    x: SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 10,
    y: self.depth2y(self.depth),
    fontSize: 12,
    fontStyle: 'bold',
    fontFamily: 'sans-serif',
    fill: SnowProfile.LABEL_COLOR,
    align: 'left',
    visible: 0
  });
  SnowProfile.kineticJSLayer.add(this.handleLoc);

  /**
   Style the cursor for the handle
   @callback
   */
  this.handle.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
  });

  /**
   Style the cursor for the handle
   @callback
   */
  this.handle.on('mouseout', function() {
    self.handleLoc.setVisible(0);
    SnowProfile.stage.draw();
    document.body.style.cursor = 'default';
  });

  /**
   When the handle is in use, show its location to the right.
   @callback
   */
  this.handle.on('mousedown', function() {
    self.handleLoc.setVisible(1);
    self.handleTouched = true;
    SnowProfile.stage.draw();
  });

  /**
   When the mouse releases the handle, stop showing its location.
   @callback
   */
  this.handle.on('mouseup', function() {
    self.handleLoc.setVisible(0);
    SnowProfile.stage.draw();
  });
  SnowProfile.kineticJSLayer.add(this.handle);

  /**
   Define end points of horizontal line from the Y axis to the handle.

   The horizontal line extends from the left edge of the graph right to
   the maximum of (X of SnowProfile, X of snow layer above).
   @returns {number[]} Two-dimensional array of numbers of the starting and
   ending points for the horizontal line.
   */
  this.horizLinePts = function() {
    var x = self.handle.getX();
    var i = self.getIndex();
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
    var x = self.handle.getX();
    var topY = self.handle.getY() + (SnowProfile.HANDLE_SIZE / 2);
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
    var i = self.getIndex();
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
      yLeft = self.handle.getY() + SnowProfile.HANDLE_SIZE / 2;
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
      self.grainShape = data.grainShape;
      self.grainSize = data.grainSize;
      if ((self.grainShape === "") &&
        (self.grainSize === "")) {

        // No information about grains
        self.grainDescr.setText("");
      }
      else {

        // Build a text description from what we have
        var text = "";
        if (self.grainShape !== "") {
          text += SnowProfile.CAAML_SHAPE[self.grainShape] +
            "\nsome second line\n";
        }
        if (self.grainSize !== "") {
          text += SnowProfile.CAAML_SIZE[self.grainSize];
        }
        self.grainDescr.setText(text);
      }

      // Liquid water content description
      self.lwc = data.lwc;
      if (self.lwc === "") {
        self.LWCDescr.setText("");
      }
      else {
        self.LWCDescr.setText(SnowProfile.CAAML_LWC[self.lwc]);
      }

      // Comment description
      self.comment = data.comment
      if (self.comment === "") {
        self.commentDescr.setText("");
      }
      else {
        self.commentDescr.setText(self.comment);
      }
      self.draw();
    }
    else {

      // Called with no argument, return an object with the values
      return {
        grainShape: self.grainShape,
        grainSize: self.grainSize,
        lwc: self.lwc,
        comment: self.comment,
        layer: self,
        numLayers: SnowProfile.snowLayers.length
      };
    }
  };

  /**
   Create the "Edit" button and listen for clicks on it
   @type {Object}
   */
  this.editButton = new SnowProfile.Button("Edit",
    SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) +
      ((i + 0.4) * SnowProfile.DESCR_HEIGHT));

  // Edit button clicked so pop up a modal dialog form
  $(document).bind("SnowProfileButtonClick", function(evt, extra) {
    if (extra.buttonObj === self.editButton) {
      self.popup = new SnowProfile.PopUp(self.describe());
    }
  });

  /**
   Draw this layer from depth and hardness values and adjacent layers.

   This function redraws as necessary to respond to movement of the
   handle at the top of this layer.
   */
  this.draw = function() {
    var i = self.getIndex();
    var numLayers = SnowProfile.snowLayers.length;

    // Set handle X from hardness
    self.handle.setX(self.code2x(self.hardness));

    // Set handle Y from depth
    self.handle.setY(self.depth2y(self.depth));

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
    var i = self.getIndex();
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
    if (!self.handleTouched) {

      // The user hasn't this handle since it was inited, so blink
      self.handle.setStroke(visible ? "#000" : "#FFF");
    }
    else {

      // The user has touched the handle so make it always visible
      self.handle.setStroke("#000");
    }
    SnowProfile.stage.draw();
  }; // this.setHandleVisible = function(visible) {

  /**
   When the handle moves, recalculate the hardness value displayed
   and draw the lines connected to the handle
   @callback
   */
  this.handle.on('dragmove', function() {

    // Adjust the horizontal (hardness) position
    self.hardness = self.x2code(self.handle.getX());
    self.horizLine.setPoints(self.horizLinePts());

    // Adjust the vertical (depth) position
    self.depth = self.y2depth(self.handle.getY());

    // Set the text information floating to the right of the graph
    var mm = Math.round(self.depth * 10) / 10;
    self.handleLoc.setText( '(' + mm + ', ' +
      self.x2code(self.handle.getX()) + ')');
    self.handleLoc.setY(self.depth2y(self.depth));

    // Draw the layer
    self.draw();
  }); // this.handle.on('dragmove', function() {

  /**
   Set the Y position of those parts of the layer whose Y position
   depends on the index of the snow layer in snowpack not its depth.
   This is needed when a layer is inserted or deleted.
   */
  this.setIndexPosition = function() {
    var i = self.getIndex();
    self.grainDescr.setX(SnowProfile.GRAIN_LEFT);
    self.grainDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    self.LWCDescr.setX(SnowProfile.LWC_LEFT);
    self.LWCDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    self.commentDescr.setX(SnowProfile.COMMENT_LEFT);
    self.commentDescr.setY(SnowProfile.HANDLE_MIN_Y +
      (SnowProfile.HANDLE_SIZE / 2) + 3 +
        (i * SnowProfile.DESCR_HEIGHT));
    self.lineBelow.setPoints([
      [SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 1 +
        SnowProfile.CTRLS_WD - 3, SnowProfile.lineBelowY(i)],
      [SnowProfile.STAGE_WD - 3, SnowProfile.lineBelowY(i)]
    ]);
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
