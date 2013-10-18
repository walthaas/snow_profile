  /**
   * Vertical height in pixels of the hardness (horizontal) axis label.
   * @const
   */
  var HARD_LABEL_HT = 40;

  /**
   * Horizontal width in pixels of the depth (vertical) axis label.
   * @const
   */
  var DEPTH_LABEL_WD = 40;

  /**
   * Width in pixels available for plotting data.
   * @const
   */
  var GRAPH_WIDTH = 500;

  /**
   * Height in pixels available for plotting data.
   * @const
   */
  var GRAPH_HEIGHT = 500;

  /**
   * Size in pixels of the handle square
   * @const
   */
  var HANDLE_SIZE = 7;

  /**
   * Width in pixels of the right sidebar
   * const
   */
  var RIGHT_SIDE_WD = 100;

  /**
   * Color of the labels and axis lines
   * @const
   */
  var LABEL_COLOR = '#003390';

  /**
   * Color of the chart background grid
   * @const
   */
  var GRID_COLOR = '#69768C';

  /**
   * Central x of the data plotting area.
   * @const
   */
  var GRAPH_CENTER_X = DEPTH_LABEL_WD + 1 + (GRAPH_WIDTH / 2);

  /**
   * Maximum x value allowed for a handle (hardness 'I').
   * @const
   */
  var HANDLE_MAX_X = DEPTH_LABEL_WD + 1 + GRAPH_WIDTH - HANDLE_SIZE;

  /**
   * Minimum x value allowed for a handle (hardness 'F-').
   * @const
   */
  var HANDLE_MIN_X = DEPTH_LABEL_WD + 1;

  /**
   * Width in pixels of one hardness band in the CAAML_HARD table
   *
   * Calculation depends on knowing there are 21 entries in the table
   * @const
   */
  var HARD_BAND_WD = (GRAPH_WIDTH - HANDLE_SIZE) / 20;

  /**
   * Table of CAAML hardness values (HardnessBaseEnumType).
   *
   * CAAML_HARD[i][0] is the alpha string defined by CAAML 5.0.
   * CAAML_HARD[i][1] is a boolean; whether to draw a line here.
   * CAAML_HARD[i][2] minimum x value having this hardness.  The maximum x
   *   value for this hardness is one less than the minimum for the next row.
   * @const
   */
  var CAAML_HARD = [
    ['F-',    0, HANDLE_MIN_X],
    ['F',     1, HANDLE_MIN_X + HARD_BAND_WD * 0.5],
    ['F+',    0, HANDLE_MIN_X + HARD_BAND_WD * 1.5],
    ['F-4F',  0, HANDLE_MIN_X + HARD_BAND_WD * 2.5],
    ['4F-',   0, HANDLE_MIN_X + HARD_BAND_WD * 3.5],
    ['4F',    1, HANDLE_MIN_X + HARD_BAND_WD * 4.5],
    ['4F+',   0, HANDLE_MIN_X + HARD_BAND_WD * 5.5],
    ['4F-1F', 0, HANDLE_MIN_X + HARD_BAND_WD * 6.5],
    ['1F-',   0, HANDLE_MIN_X + HARD_BAND_WD * 7.5],
    ['1F',    1, HANDLE_MIN_X + HARD_BAND_WD * 8.5],
    ['1F+',   0, HANDLE_MIN_X + HARD_BAND_WD * 9.5],
    ['1F-P',  0, HANDLE_MIN_X + HARD_BAND_WD * 10.5],
    ['P-',    0, HANDLE_MIN_X + HARD_BAND_WD * 11.5],
    ['P',     1, HANDLE_MIN_X + HARD_BAND_WD * 12.5],
    ['P+',    0, HANDLE_MIN_X + HARD_BAND_WD * 13.5],
    ['P-K',   0, HANDLE_MIN_X + HARD_BAND_WD * 14.5],
    ['K-',    0, HANDLE_MIN_X + HARD_BAND_WD * 15.5],
    ['K',     1, HANDLE_MIN_X + HARD_BAND_WD * 16.5],
    ['K+',    0, HANDLE_MIN_X + HARD_BAND_WD * 17.5],
    ['K-I',   0, HANDLE_MIN_X + HARD_BAND_WD * 18.5],
    ['I',     1, HANDLE_MIN_X + HARD_BAND_WD * 19.5],
  ];

  /**
   * Vertical height in pixels of the KineticJS stage
   * @const
   */
  var STAGE_HT = GRAPH_HEIGHT + HARD_LABEL_HT + 1;

  /**
   * Horizontal width in pixels of the KineticJS stage
   * @const
   */
  var STAGE_WD = DEPTH_LABEL_WD + 1 + GRAPH_WIDTH + RIGHT_SIDE_WD;

  /**
   * KineticJS stage object for the whole program
   */
  var snow_profile_stage;

  /**
   * Maximum snow depth in cm that can be plotted on the graph
   *
   * Snow depth in cm that corresponds to GRAPH_HEIGHT pixels.
   * Zero depth always corresponds to zero graph pixels.
   */
  var snow_profile_max_depth = 200;

  /**
   * Object to manage a doubly-linked list
   *
   * The objects on the list have properties 'before' and 'after' pointing
   * to the object before resp. after on the list.
   * @class
   * @constructs Dlist
   */
  function Dlist() {

    "use strict";
    /**
     * The first object in the list.
     * @member {Object}
     */
    this.first = null;

    // The last object in the list
    this.last = null;
  }

  // Insert an object before a member of a list
  Dlist.prototype.insertBefore = function(member, beforeThis) {
      // FIXME
  };

  // Insert an object after a member of a list
  Dlist.prototype.insertAfter = function(member, afterThis) {
      // FIXME
  };

  // Add an object to the tail of the list
  Dlist.prototype.append = function(member) {
    "use strict";
    if (this.first === null) {

      // The list is now empty so this object is both first and last.
      this.first = this.last = member;
    }
    else {

      // The list is not empty.  Add this object to the tail of the list.
      var oldTail = this.tail;
      this.tail = member;
      member.before = oldTail;
      member.after = null;
    }
  };

  // Delete an object from the list
  Dlist.prototype.delete = function(member) {
      // FIXME
  };

  /**
   * Snow stratigraphy snow layers
   * NB: The KineticJS library refers to a visual layer of the diagram
   *     as a "layer" so be careful which type of layer is meant!
   */
  var snow_profile_layers = new Dlist();

  // only KineticJS layer at this moment
  var layer;

  /**
   * Object describing a single snow stratigraphy layer
   * @constructor
   */
  function SnowProfileLayer(depth, hardness) {
    "use strict";

    // Reference this object inside an event handler
    var thisObj = this;

    // The layer object before (above) this one.
    // Points to a SnowProfileLayer or is null.
    this.before = null;

    // The layer object after (below) this one.
    // Points to a SnowProfileLayer or is null.
    this.after = null;

    // Depth of the top of this layer in cm from the snow surface.
    // A non-negative number.
    this.depth = depth;

    // Hardness of this snow layer.
    // A string code from the CAAML_HARD table above.
    this.hardness = hardness;

    // Handle for the line at the top of the layer.
    // The user drags and drops this handle to adjust depth and hardness.
    this.handle = new Kinetic.Rect({
      x: thisObj.code2x(thisObj.hardness),
      y: thisObj.depth2y(thisObj.depth),
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      fill: '#000',
      draggable: true,
      dragBoundFunc: function(pos) {
        var newX = pos.x;
        if (pos.x < HANDLE_MIN_X) {
          newX = HANDLE_MIN_X;
        }
        else if (pos.x > HANDLE_MAX_X) {
          newX = HANDLE_MAX_X;
        }
        var newY = pos.y;
        if (thisObj.before === null) {

          // This is the top (snow surface) layer.
          // Handle stays on the surface.
          newY = 0;
        }
        else if (thisObj.after === null) {

          // This is the bottom layer.  The handle depth is constrained
          // between the layer above and GRAPH_HEIGHT.
          if (pos.y > (GRAPH_HEIGHT - HANDLE_SIZE)) {
            newY = GRAPH_HEIGHT - HANDLE_SIZE;
          }
          else if (pos.y < 1) {
            newY = 1;
          }
        }
        else {

          // This layer is below the surface and above the bottom.
          // The handle depth is contstrained between layers above and below.
          // FIXME          
        }
        thisObj.depth = thisObj.y2depth(newY);
        return{
          x: newX,
          y: newY
        };
      }
    });

    // Add text to show current surface handle location.
    this.handle_loc = new Kinetic.Text({
      x: DEPTH_LABEL_WD + 1 + GRAPH_WIDTH + 10,
      y: thisObj.depth2y(thisObj.depth),
      fontSize: 12,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: LABEL_COLOR,
      align: 'left',
      visible: 0
    });

    // Style the cursor for the handle
    this.handle.on('mouseover', function() {
      document.body.style.cursor = 'pointer';
      thisObj.handle_loc.setVisible(1);
      snow_profile_stage.draw();
    });
    this.handle.on('mouseout', function() {
      document.body.style.cursor = 'default';
      thisObj.handle_loc.setVisible(0);
      snow_profile_stage.draw();
    });
    layer.add(this.handle);

    // Add a horizontal line at the top of the layer
    this.horiz_line = new Kinetic.Line({
      points: [[DEPTH_LABEL_WD + 1,
                thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)],
               [this.handle.getX(),
                thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)]],
      stroke: '#000'
    });
    layer.add(this.horiz_line);

    // Add a vertical line to show hardness of the layer
    // FIXME

    // When the handle moves, recalculate the hardness value displayed
    this.handle.on('dragmove', function() {
      thisObj.horiz_line.setPoints([
        [DEPTH_LABEL_WD + 1,
          thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)],
        [thisObj.handle.getX(),
         thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)]
      ]);
      var mm = Math.round(thisObj.depth * 10) / 10;
      thisObj.handle_loc.setText( '(' + mm + ', ' +
        thisObj.x2code(thisObj.handle.getX()) + ')');
      thisObj.handle_loc.setY(thisObj.depth2y(thisObj.depth));
    });
    layer.add(this.handle_loc);
  } // function SnowProfileLayer()

  /**
   * Convert a hardness code to an X axis position
   */
  SnowProfileLayer.prototype.code2x = function(code) {
    "use strict";
    var x = HANDLE_MIN_X;
    for (var i = 0; i < CAAML_HARD.length; i++) {
      if (code === CAAML_HARD[i][0]) {
        x = CAAML_HARD[i][2] + HARD_BAND_WD * 0.5;
        break;
      }
    }
    return x;
  };

  /**
   * Convert an X axis position to a hardness code
   */
  SnowProfileLayer.prototype.x2code = function(x) {
    "use strict";
    var code = 'I';
    for (var i = 0; i < CAAML_HARD.length - 1; i++) {
      if ((x >= (CAAML_HARD[i][2]) &&
        (x < (CAAML_HARD[i+1][2])))) {
        code = CAAML_HARD[i][0];
        break;
      }
    }
    return code;
  };

  /**
   * Convert a depth in cm to a Y axis position
   *
   * Y axis scale is max depth of snow / graph height in pixels
   * NB: assumes snow surface at Y == 0.
   */
  SnowProfileLayer.prototype.depth2y = function(depth) {
    "use strict";
    return depth * (GRAPH_HEIGHT / snow_profile_max_depth);
  };

  /**
   * Convert a Y axis position to a depth in cm
   * NB: assumes snow surface at Y == 0.
   */
  SnowProfileLayer.prototype.y2depth = function(y) {
    "use strict";
    return (y / GRAPH_HEIGHT) * snow_profile_max_depth;
  };

  /**
   * Initialize the container and the grid layer
   */
  function snow_profile_init() {
    "use strict";
    snow_profile_stage = new Kinetic.Stage({
      container: 'snow_profile_diagram',
      width: STAGE_WD,
      height: STAGE_HT
    });

    // Create the reference grid layer
    layer = new Kinetic.Layer();

    // Draw and label the depth (vertical) axis
    layer.add(new Kinetic.Line({
      points: [DEPTH_LABEL_WD, 0, DEPTH_LABEL_WD, GRAPH_HEIGHT + 1],
      stroke: LABEL_COLOR,
      strokeWidth: 1
    }));
    for (var j = 0; j < GRAPH_HEIGHT; j += 50) {
      layer.add(new Kinetic.Text({
        x: 10,
        y: j,
        text: j/2.5,
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        fill: LABEL_COLOR,
        align: 'right'
      }));
      if (j) {
        layer.add(new Kinetic.Line({
          points: [
            [DEPTH_LABEL_WD + 1, j + 1],
            [DEPTH_LABEL_WD + 1 + GRAPH_WIDTH, j]
          ],
          stroke: GRID_COLOR,
          strokeWidth: 1
        }));
      }
    }

    // Draw and label the hardness (horizontal) axis
    layer.add(new Kinetic.Line({
      points: [
        [DEPTH_LABEL_WD, GRAPH_HEIGHT + 1],
        [DEPTH_LABEL_WD + GRAPH_WIDTH, GRAPH_HEIGHT + 1]
      ],
      stroke: LABEL_COLOR,
      strokeWidth: 1
    }));

    // Iterate through the table of CAAML hardness codes to
    // build the hardness (horizontal) scale for the graph area
    for (var i = 0; i < CAAML_HARD.length; i++) {
      var x = DEPTH_LABEL_WD + 1 + (HARD_BAND_WD * i) + (HANDLE_SIZE / 2);
      if (CAAML_HARD[i][1]) {

        // Add a vertical line to show this hardness value
        layer.add(new Kinetic.Line({
          points: [
            [x, 0],
            [x, GRAPH_HEIGHT]
          ],
          stroke: GRID_COLOR,
          strokeWidth: 1
        }));
        layer.add(new Kinetic.Text({
          x: x,
          y: GRAPH_HEIGHT + 10,
          text: CAAML_HARD[i][0],
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: LABEL_COLOR,
          align: 'center'
        }));
      }
    }
    var hardness_text = new Kinetic.Text({
      x: GRAPH_CENTER_X,
      y: STAGE_HT - 14,
      text: 'Hardness',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: LABEL_COLOR,
      align: 'center'
    });
    hardness_text.setOffsetX(hardness_text.getWidth() / 2 );
    layer.add(hardness_text);
  }  // function snow_profile_init();

  /**
   * Main program
   */
  snow_profile_init();
  snow_profile_layers.append(new SnowProfileLayer(0, '4F'));
  snow_profile_layers.append(new SnowProfileLayer(25, '1F'));
  // add the layer to the stage
  snow_profile_stage.add(layer);

// Configure Emacs for Drupal JavaScript coding standards
// Local variables:
// mode: js2-mode
// End:
