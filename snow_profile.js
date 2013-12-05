/**
 * @namespace SnowProfile
 */
var SnowProfile = {};

  /**
   * Layout of the snow profile Kinetic stage:
   *
   *       | Temperature |
   *       | Label       |
   * ___________________________________________________________________
   *       |             |
   * Depth |             |
   * Label | Graph       | Controls
   *       |             |
   *____________________________________________________________________
   *       | Hardness    |
   *       | Label       |
   */

(function() {
  "use strict";
  SnowProfile = {

    /**
     * Horizontal width in pixels of the depth (vertical) axis label.
     * @const
     */
    DEPTH_LABEL_WD: 40,

    /**
     * Width in pixels available for plotting data.
     * @const
     */
    GRAPH_WIDTH: 500,

    /**
     * Width in pixels of the connector (diagonal line) area
     * @const
     */
    CTRLS_WD: 500,

    /**
     * Vertical height in pixels of the temperature (horizontal) axis label.
     * @const
     */
    TEMP_LABEL_HT: 40,

    /**
     * Height in pixels available for plotting data.
     * @const
     */
    GRAPH_HEIGHT: 500,

    /**
     * Vertical height in pixels of the hardness (horizontal) axis label.
     * @const
     */
    HARD_LABEL_HT: 40,

    /**
     * Size in pixels of the handle square
     * @const
     */
    HANDLE_SIZE: 9,

    /**
     * Color of the labels and axis lines
     * @const
     */
     LABEL_COLOR: '#003390',

    /**
     * Color of the chart background grid
     * @const
     */
    GRID_COLOR: '#69768C',

    /**
      Maximum snow depth in cm that can be plotted on the graph.

      Snow depth in cm that corresponds to GRAPH_HEIGHT pixels.
      Zero depth always corresponds to zero graph pixels.
      @const
     */
    MAX_DEPTH:  200,

    /**
      Depth increment in cm to allow when inserting a layer above
      or below another layer.
      @const
      @type {number}
     */
    INS_INCR: 5,

    /**
      HTML for edit buttons for a snow layer
      @const
      @type {string}
     */
    ctrls_html: "<tr>" +
      "<td><button name=\"ia\">insert above</button></td>" +
      "<td><button name=\"ib\">insert below</button></td>" +
      "<td><button name=\"del\">delete</button></td>" +
      "</tr>",

    /**
     * KineticJS stage object for the whole program
     */
    stage: null,

    /**
     * KineticJS drawing layer.
     */
    kineticJSLayer: null,

    /**
      Snow stratigraphy snow layers.

      The Layer objects are referenced by this array which is ordered by
      the depth of the layer.  The top layer(depth == 0) is always referenced
      by snowLayers[0].  When a Layer object is created or removed, it is
      spliced into the array so that the order of depths is maintained, and
      the indexes increment by 1.  When the depth of a layer is changed by the
      user, the new depth is constrained to be less than the depth of the layer
      above and more than the depth of the layer below in the snow pack.
      @type {SnowProfile.Layer[]}
     */
    snowLayers: [],

    /**
      Make the handle of each layer visible
      @type {boolean}
     */
    showHandle: null,

    /**
      Previous state of showHandle
      @type {boolean}
     */
    oldShowHandle: null
  };

  /**
    Central x of the data plotting area.
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.GRAPH_CENTER_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.GRAPH_WIDTH / 2);

  /**
    Maximum x value allowed for a handle (hardness 'I').
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MAX_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH - (SnowProfile.HANDLE_SIZE / 2);

  /**
    Minimum x value allowed for a handle (hardness 'F-').
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MIN_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.HANDLE_SIZE / 2);

  /**
   * Minimum Y value allowed for a handle (top of graph area)
   * @const
     @memberof SnowProfile
   */
  SnowProfile.HANDLE_MIN_Y = SnowProfile.TEMP_LABEL_HT + 1;

  /**
    Maximum Y value allowed for any handle (bottom of graph area)
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MAX_Y = SnowProfile.TEMP_LABEL_HT + 1 +
    SnowProfile.GRAPH_HEIGHT;

  /**
    Width in pixels of one hardness band in the CAAML_HARD table

    Calculation depends on knowing there are 21 entries in the table
    @const
    @memberof SnowProfile
   */
  SnowProfile.HARD_BAND_WD = (SnowProfile.GRAPH_WIDTH -
    SnowProfile.HANDLE_SIZE) / 20;

  /**
   Table of CAAML hardness values (HardnessBaseEnumType).

   + CAAML_HARD[i][0] is the alpha string defined by CAAML 5.0.
   + CAAML_HARD[i][1] is a boolean; whether to draw a line here.
   + CAAML_HARD[i][2] minimum x value having this hardness.  The
     maximum x value for this hardness is one less than the minimum for
     the next row.
     @const
     @type {string[]}
     @memberof SnowProfile
   */
  SnowProfile.CAAML_HARD = [
    ['F-',    0, SnowProfile.HANDLE_MIN_X],
    ['F',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 0.5],
    ['F+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 1.5],
    ['F-4F',  0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 2.5],
    ['4F-',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 3.5],
    ['4F',    1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 4.5],
    ['4F+',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 5.5],
    ['4F-1F', 0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 6.5],
    ['1F-',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 7.5],
    ['1F',    1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 8.5],
    ['1F+',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 9.5],
    ['1F-P',  0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 10.5],
    ['P-',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 11.5],
    ['P',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 12.5],
    ['P+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 13.5],
    ['P-K',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 14.5],
    ['K-',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 15.5],
    ['K',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 16.5],
    ['K+',    0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 17.5],
    ['K-I',   0, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 18.5],
    ['I',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 19.5],
  ];

  /**
   * Vertical height in pixels of the KineticJS stage
   * @const
     @memberof SnowProfile
   */
   SnowProfile.STAGE_HT =  SnowProfile.TEMP_LABEL_HT + 1 +
     SnowProfile.GRAPH_HEIGHT + 1 + SnowProfile.HARD_LABEL_HT;

  /**
   * Horizontal width in pixels of the KineticJS stage
   * @const
     @memberof SnowProfile
   */
   SnowProfile.STAGE_WD = SnowProfile.DEPTH_LABEL_WD + 1 +
     SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD;

  /**
   * Depth scale in pixels per cm
   * @const
     @memberof SnowProfile
   */
  SnowProfile.DEPTH_SCALE = SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH;
})();

  /**
    Object describing a single snow stratigraphy layer.
    @param {number} depth Initial depth in cm of this layer from the top
    of the snow pack.
    @constructor
   */
  SnowProfile.Layer = function(depth) {
    "use strict";
    //console.debug("SnowProfile.Layer(%d)", depth);
    // Reference SnowProfile object inside an event handler
    var that = this;

    // Insert this Layer in the appropriate place in the snow pack.
    var i;
    var numLayers = SnowProfile.snowLayers.length;
    var inserted = false;
    //console.debug("SnowProfile.Layer(%d).  old numLayers=%d",
    //  depth, numLayers);
    //console.debug(SnowProfile.snowLayers);

    /**
      Depth of the top of this SnowProfileLayer in cm from the snow surface.
      @type {number}
     */
    this.depth = depth;

    /**
      Hardness of this snow layer.

      A string code from the SnowProfile.CAAML_HARD table above.
      Initial null means the handle is untouched.
      @type {string}
     */
    this.hardness = null;
    //console.debug("hardness set to %s", that.hardness);
    // Insert this layer above the first layer that is deeper
    for (i = 0; i<numLayers; i++) {
      if (SnowProfile.snowLayers[i].getDepth() >= depth) {
        SnowProfile.snowLayers.splice(i, 0, this);
        inserted = true;
        //console.debug("layer %d inserted", i);
        break;
      }
    }

    // If no deeper layer was found, add this layer at the bottom.
    // This also handles the initial case where there were no layers.
    if (!inserted) {
      SnowProfile.snowLayers.push(this);
    }
    // Enable all delete buttons
    $("#snow_profile_ctrls button[name=\"del\"]").removeAttr("disabled");

    // Add one more row of buttons
    $("#snow_profile_ctrls tbody:last-child").append(
      SnowProfile.ctrls_html);
    //console.dir(SnowProfile.snowLayers);

    /**
      Has the user touched the handle since this layer was created?

      Used to make an untouched handle throb visibly, to draw the user's
      attention to the need to set the handle position.
      @type {boolean}
     */
    this.handleTouched = false;

    /**
      Handle for the line at the top of the layer.

      The user drags and drops this handle to adjust depth and hardness.
      @type {Object}
     */
    this.handle = new Kinetic.Rect({
      x: SnowProfile.HANDLE_MIN_X,
      y: that.depth2y(that.depth),
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
        var i = that.getIndex();
        var numLayers = SnowProfile.snowLayers.length;
        if (i === 0) {

          // SnowProfile is the top (snow surface) layer.
          // Handle stays on the surface.
          newY = SnowProfile.HANDLE_MIN_Y;
        }
        else if (i === (numLayers - 1)) {

          // SnowProfile is the bottom layer.  The handle depth is constrained
          // between the layer above and GRAPH_HEIGHT.
          if (pos.y > (SnowProfile.HANDLE_MAX_Y)) {
            newY = SnowProfile.HANDLE_MAX_Y;
          }
          else if (pos.y < SnowProfile.snowLayers[i - 1].handleGetY()) {
            newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
          }
        }
        else {

          // SnowProfile layer is below the surface and above the bottom.
          // The handle depth is constrained between layers above and below.
            if (pos.y > SnowProfile.snowLayers[i + 1].handleGetY()) {
              newY = SnowProfile.snowLayers[i + 1].handleGetY() - 1;
            }
            else if (pos.y < SnowProfile.snowLayers[i - 1].handleGetY()) {
              newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
            }
        }
        that.depth = that.y2depth(newY);
        return{
          x: newX,
          y: newY
        };
      }
    });

    /**
      Remove and destroy all KineticJS objects belonging to this snow layer
     */
    this.destroy = function() {
      that.handle.off('mouseup mousedown dragmove mouseover mouseout');
      that.handle.destroy();
      that.handle_loc.destroy();
      that.horiz_line.destroy();
      that.vert_line.destroy();
    };

    /**
      Return depth in cm of this snow layer
      @returns {number} Depth of top of this layer in cm below surface
     */
    this.getDepth = function() {
      return that.depth;
    };

    /**
      Get index of this object in snowLayers[]
      @returns {number} Integer index into snowLayers[]
     */
    this.getIndex = function() {
      var i;
      var numLayers = SnowProfile.snowLayers.length;
      for (i = 0; i < numLayers; i++) {
        if (SnowProfile.snowLayers[i] === that) {
          return i;
        }
      }
      console.error("Object not found in snowLayers[]");
    };

    /**
      Return the current X position of the handle
      @returns {number}
     */
    this.handleGetX = function() {
      return that.handle.getX();
    };

    /**
      Return the current Y position of the handle
      @returns {number}
     */
    this.handleGetY = function() {
      return that.handle.getY();
    };

    /**
      Add text to show current handle location.
     */
    this.handle_loc = new Kinetic.Text({
      x: SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH + 10,
      y: that.depth2y(that.depth),
      fontSize: 12,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: 'left',
      visible: 0
    });
    SnowProfile.kineticJSLayer.add(this.handle_loc);

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
      document.body.style.cursor = 'default';
    });

    /**
      When the handle is in use, show its location to the right.
      @callback
     */
    this.handle.on('mousedown', function() {
      that.handle_loc.setVisible(1);
      that.handleTouched = true;
      SnowProfile.stage.draw();
    });

    /**
      When the handle is in use, show its location to the right.
      @callback
     */
    this.handle.on('mouseup', function() {
      that.handle_loc.setVisible(0);
      SnowProfile.stage.draw();
    });
    SnowProfile.kineticJSLayer.add(this.handle);

    /**
      Define horizontal line from the Y axis to the handle.

      The horizontal line extends from the left edge of the graph right to
      the maximum of (X of SnowProfile, X of snow layer above).
      @returns {Array} Two-dimensional array of numbers of the starting and
      ending points for the horizontal line.
     */
    this.horiz_line_pts = function() {
      var x = that.handle.getX();
      var i = that.getIndex();
        if (i !== 0) {
          x = Math.max(x, SnowProfile.snowLayers[i-1].handleGetX());
      }
      return  [
        [SnowProfile.DEPTH_LABEL_WD + 1,
         that.depth2y(that.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)],
        [x,
          that.depth2y(that.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)]
      ];
    };

    /**
      Draw a horizontal line at the top of the layer
      @type {Object}
     */
    this.horiz_line = new Kinetic.Line({
      points: that.horiz_line_pts(),
      stroke: '#000'
    });
    SnowProfile.kineticJSLayer.add(this.horiz_line);

    /**
      Define vertical line from the handle down to the top of the layer
      below in the snow pack, or the graph bottom if this is lowest
      layer.
      @returns {number[]} Two-dimensional array of numbers of the starting
      and ending points for the vertical line.
     */
    this.vert_line_pts = function() {
      //console.debug("vert_line_pts() called");
      var x = that.handle.getX();
      var topY = that.handle.getY() + (SnowProfile.HANDLE_SIZE / 2);
      var bottomY = SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2);
      var i = that.getIndex();
      var numLayers = SnowProfile.snowLayers.length;
      //console.debug("i=%d  numLayers=%d", i, numLayers);

      // If this layer is not the lowest layer in the snowpack, bottom
      // Y is the top of the layer below.
      if (i !== numLayers - 1) {
        bottomY = SnowProfile.snowLayers[i + 1].handleGetY() +
          SnowProfile.HANDLE_SIZE / 2;
      }
      return [[x, topY],[x, bottomY]];
    };

    /**
      Draw a vertical line from the handle down to the top of the layer
      below, or graph bottom if this is the lowest layer.
      @type {Object}
     */
    this.vert_line = new Kinetic.Line({
      points: that.vert_line_pts(),
      stroke: '#000'
    });
    SnowProfile.kineticJSLayer.add(this.vert_line);
    //console.debug("vertical line added");

    /**
      Draw this layer from depth and hardness values and adjacent layers.
     */
    this.draw = function() {
      var i = that.getIndex();
      var numLayers = SnowProfile.snowLayers.length;

      // Set handle X from hardness
      //console.debug("setting handle x from "+that.hardness);
      //console.debug("new x = "+that.code2x(that.hardness));
      that.handle.setX(that.code2x(that.hardness));

      // Set handle Y from depth
      that.handle.setY(that.depth2y(that.depth));

      // Adjust the horizontal line
      that.horiz_line.setPoints(that.horiz_line_pts());

      // Adjust the vertical line
      that.vert_line.setPoints(that.vert_line_pts());

      // Adjust the horizontal line of the layer below, if any
      if (i !== (numLayers - 1)) {
        SnowProfile.snowLayers[i + 1].horiz_line.setPoints(
          SnowProfile.snowLayers[i + 1].horiz_line_pts());
      }

      // Adjust the vertical line of the layer above, if any
      if (i !== 0) {
        SnowProfile.snowLayers[i - 1].vert_line.setPoints(
          SnowProfile.snowLayers[i - 1].vert_line_pts());
      }
      SnowProfile.stage.draw();
    };

    /**
      Push this layer down to make room to insert a layer above
     */
    this.pushDown = function() {
      var i = that.getIndex();
      var numLayers = SnowProfile.snowLayers.length;
      var spaceBelow;

      // How much room is there below this layer?
      if (i !== (numLayers - 1)) {

        // This isn't the bottom layer so we need to check distance
        // from this layer to the next lower layer
        spaceBelow = SnowProfile.snowLayers[i + 1].getDepth() -
          that.depth;
        if (spaceBelow < SnowProfile.INS_INCR) {

          // Push the layer below down to make space
          SnowProfile.snowLayers[i + 1].pushDown();
        }
      }

      // Now that we know there is space below this layer we can push
      // it down by the normal insertion increment.
      that.depth += SnowProfile.INS_INCR;
      that.draw();
    };

    /**
      Set the depth of the layer and draw.
      @param {number} depth Depth in centimeters of the top of this layer.
     */
    this.setDepth = function(depth) {
      that.depth = depth;
      that.draw();
    };

    /**
      Set handle visibility, if it is untouched
      @param {boolean} visible Make the handle visible?
     */
    this.setHandleVisible = function(visible) {
      if (!that.handleTouched) {

        // The user hasn't this handle since it was inited, so blink
        that.handle.setStroke(visible ? "#000" : "#FFF");
      }
      else {

        // The use has touched the handle so make it always visible
        that.handle.setStroke("#000");
      }
      SnowProfile.stage.draw();
    };

    // When the handle moves, recalculate the hardness value displayed
    // and draw the lines connected to the handle
    this.handle.on('dragmove', function() {
      var i = that.getIndex();
      var numLayers = SnowProfile.snowLayers.length;

      // Adjust the horizontal (hardness) position
      that.hardness = that.x2code(that.handle.getX());
      //console.debug("hardness set to %s", that.hardness);
      that.horiz_line.setPoints(that.horiz_line_pts());

      // Adjust the vertical (depth) position
      that.depth = that.y2depth(that.handle.getY());
      that.vert_line.setPoints(that.vert_line_pts());

      // Adjust the horizontal line of the layer below, if any
      if (i !== (numLayers - 1)) {
        SnowProfile.snowLayers[i + 1].horiz_line.setPoints(
          SnowProfile.snowLayers[i + 1].horiz_line_pts());
      }

      // Adjust the vertical line of the layer above, if any
      if (i !== 0) {
        SnowProfile.snowLayers[i - 1].vert_line.setPoints(
          SnowProfile.snowLayers[i - 1].vert_line_pts());
      }

      // Set the text information floating to the right of the graph
      var mm = Math.round(that.depth * 10) / 10;
      that.handle_loc.setText( '(' + mm + ', ' +
        that.x2code(that.handle.getX()) + ')');
      that.handle_loc.setY(that.depth2y(that.depth));
    });
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
    //console.debug("hardness %s to x %d", code, x);
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

  /**
   * Initialize the container and the grid layer
   */
  SnowProfile.init = function() {
    "use strict";
    SnowProfile.stage = new Kinetic.Stage({
      container: 'snow_profile_diagram',
      width: SnowProfile.STAGE_WD,
      height: SnowProfile.STAGE_HT
    });

    // Create the reference grid layer
    SnowProfile.kineticJSLayer = new Kinetic.Layer();

      // Draw the vertical line along the left edge
    SnowProfile.kineticJSLayer.add(new Kinetic.Line({
      points: [
        [SnowProfile.DEPTH_LABEL_WD, SnowProfile.HANDLE_MIN_Y - 1 +
          (SnowProfile.HANDLE_SIZE / 2)],
        [SnowProfile.DEPTH_LABEL_WD, SnowProfile.HANDLE_MAX_Y +
          (SnowProfile.HANDLE_SIZE / 2)]
      ],
      stroke: SnowProfile.LABEL_COLOR,
      strokeWidth: 1
    }));

    // Add text every 20 cm to the depth label area
    for (var cm = 0; cm <= SnowProfile.MAX_DEPTH; cm += 20) {
      SnowProfile.kineticJSLayer.add(new Kinetic.Text({
        x: 10,
        y: SnowProfile.HANDLE_MIN_Y + cm * SnowProfile.DEPTH_SCALE,
        text: cm,
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        fill: SnowProfile.LABEL_COLOR,
        align: 'right'
      }));

      // Draw a horizontal line every 20 cm as a depth scale
      if (cm !== SnowProfile.MAX_DEPTH) {
        SnowProfile.kineticJSLayer.add(new Kinetic.Line({
          points: [
            [SnowProfile.DEPTH_LABEL_WD + 1,
              SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) +
                (cm * SnowProfile.DEPTH_SCALE)],
            [SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH -
              SnowProfile.HANDLE_SIZE / 2,
              SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) +
                (cm * SnowProfile.DEPTH_SCALE)]
          ],
          stroke: SnowProfile.GRID_COLOR,
          strokeWidth: 1
        }));
      }
    }

    // Draw and label the hardness (horizontal) axis
    SnowProfile.kineticJSLayer.add(new Kinetic.Line({
      points: [
        [SnowProfile.DEPTH_LABEL_WD,
          SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)],
        [SnowProfile.DEPTH_LABEL_WD + SnowProfile.GRAPH_WIDTH +1 -
          SnowProfile.HANDLE_SIZE / 2,
          SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)]
      ],
      stroke: SnowProfile.LABEL_COLOR,
      strokeWidth: 1
    }));

    // Iterate through the table of CAAML hardness codes to
    // build the hardness (horizontal) scale for the graph area
    for (var i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      var x = SnowProfile.DEPTH_LABEL_WD + 1 + (SnowProfile.HARD_BAND_WD * i) +
        (SnowProfile.HANDLE_SIZE / 2);
      if (SnowProfile.CAAML_HARD[i][1]) {

        // Add a vertical line to show SnowProfile hardness value
        SnowProfile.kineticJSLayer.add(new Kinetic.Line({
          points: [
            [x, SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)],
            [x, SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)]
          ],
          stroke: SnowProfile.GRID_COLOR,
          strokeWidth: 1
        }));
        SnowProfile.kineticJSLayer.add(new Kinetic.Text({
          x: x,
          y: SnowProfile.HANDLE_MAX_Y + 10,
          text: SnowProfile.CAAML_HARD[i][0],
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR,
          align: 'center'
        }));
      }
    }
    var hardness_text = new Kinetic.Text({
      x: SnowProfile.GRAPH_CENTER_X,
      y: SnowProfile.STAGE_HT - 14,
      text: 'Hardness',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: 'center'
    });
    hardness_text.setOffsetX(hardness_text.getWidth() / 2 );
    SnowProfile.kineticJSLayer.add(hardness_text);

    // add the KineticJS layer to the stage
    SnowProfile.stage.add(SnowProfile.kineticJSLayer);

    // Create an animation
    var anim = new Kinetic.Animation(function(frame) {
      SnowProfile.showHandle = (frame.time % 1000) > 500;
      if (SnowProfile.oldShowHandle === null) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;
      }
      else {
        if (SnowProfile.showHandle !== SnowProfile.oldShowHandle) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;

          // For each snow layer, if handle untouched, blink
          var i;
          var numLayers = SnowProfile.snowLayers.length;
          for (i = 0; i < numLayers; i++) {
            SnowProfile.snowLayers[i].setHandleVisible(SnowProfile.showHandle);
          }
        }
      }
    });
    anim.start();

    // Listen to all buttons now and future in the controls table
    $("#snow_profile_ctrls").delegate("button", "click",
      function(){
        var i = $("#snow_profile_ctrls tr").index(this.parentNode.parentNode);
        //var row$ = $($("#snow_profile_ctrls tr")[i]);
        //console.debug("row=%d  row$=%o", i, row$);
        //row$.css("background-color", "yellow").show("fast");
        var numLayers = SnowProfile.snowLayers.length;
        var layer = SnowProfile.snowLayers[i];
        var newLayer;
        //console.debug("button=%s  i=%d  layer=%o", this.name, i, layer);
        //console.dir(SnowProfile.snowLayers);
        var name = this.name;
        switch (name) {
          case "ia":
            if (i === 0) {

              // Special case of inserting above top layer
              layer.pushDown();
              //console.debug("new Layer(0)");
              newLayer = new SnowProfile.Layer(0);
              //console.debug("back from constructor");
            }
            else {
              alert("not implemented");
            }
            break;

          case "ib":
            alert("not implemented");
            break;

          case "del":
            // Remove this Layer from the snowLayers array
            SnowProfile.snowLayers.splice(i, 1);

            // Destroy KineticJS object of this layer
            layer.destroy();

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

            // Remove row of buttons for this layer
            $("#snow_profile_ctrls tr").eq(i).remove();

            // Check how many layers remain in the list.  If there is only one
            // remaining, we can't allow it to be deleted
            if (numLayers === 1) {
              $("#snow_profile_ctrls button[name=\"del\"]").attr(
                "disabled", "disabled");
            }
            SnowProfile.stage.draw();
            break;

          default:
            console.error("click from button with unknown name " + name);
          }
        //console.dir(SnowProfile.snowLayers);
      });
  };  // function SnowProfile.init();

  /**
   * Main program
   */
  SnowProfile.init();
  //console.dir(SnowProfile.snowLayers);
  new SnowProfile.Layer(0);
  new SnowProfile.Layer(20);
  new SnowProfile.Layer(40);
  //console.dir(SnowProfile.snowLayers);

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// c-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
