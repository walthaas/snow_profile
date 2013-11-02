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
   * Width in pixels of the connector (diagonal line) area
   * @const
   */
  var CTRLS_WD = 500;

  /**
   * Vertical height in pixels of the temperature (horizontal) axis label.
   * @const
   */
  var TEMP_LABEL_HT = 40;

  /**
   * Height in pixels available for plotting data.
   * @const
   */
  var GRAPH_HEIGHT = 500;

  /**
   * Vertical height in pixels of the hardness (horizontal) axis label.
   * @const
   */
  var HARD_LABEL_HT = 40;

  /**
   * Size in pixels of the handle square
   * @const
   */
  var HANDLE_SIZE = 9;

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
  var HANDLE_MAX_X = DEPTH_LABEL_WD + 1 + GRAPH_WIDTH - (HANDLE_SIZE / 2);

  /**
   * Minimum x value allowed for a handle (hardness 'F-').
   * @const
   */
  var HANDLE_MIN_X = DEPTH_LABEL_WD + 1 + (HANDLE_SIZE / 2);

  /**
   * Minimum Y value allowed for a handle (top of graph area)
   * @const
   */
  var HANDLE_MIN_Y = TEMP_LABEL_HT + 1;

  /**
   * Maximum Y value allowed for any handle (bottom of graph area)
   * @const
   */
  var HANDLE_MAX_Y = TEMP_LABEL_HT + 1 + GRAPH_HEIGHT;

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
  var STAGE_HT = TEMP_LABEL_HT + 1 + GRAPH_HEIGHT + 1 + HARD_LABEL_HT;

  /**
   * Horizontal width in pixels of the KineticJS stage
   * @const
   */
  var STAGE_WD = DEPTH_LABEL_WD + 1 + GRAPH_WIDTH + 1 + CTRLS_WD;

  /**
   * Maximum snow depth in cm that can be plotted on the graph
   *
   * Snow depth in cm that corresponds to GRAPH_HEIGHT pixels.
   * Zero depth always corresponds to zero graph pixels.
   */
  var MAX_DEPTH = 200;

  /**
   * Depth scale in pixels per cm
   */
  var DEPTH_SCALE = GRAPH_HEIGHT / MAX_DEPTH;

  /**
   * KineticJS stage object for the whole program
   */
  var snow_profile_stage;

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

    // Insert an object before a member of this list
    this.insertBefore = function(object, beforeThis) {
      var foundPlace = false;
      if (this.first === null) {

        // The list is now empty so this object is both first and last.
        this.first = this.last = object;
        foundPlace = true;
      }
      else if (this.first === beforeThis) {

        // Inserting before the first element in the list
        object.after = this.first;
        object.before = null;
        this.first = object;
        foundPlace = true;
      }
      else {

        // Inserting before some element farther in list
        var current = this.first;
        var next = current.after;
        while (next !== null) {
          if (next === beforeThis) {

            // Inserting before the next member of the list
            object.after = next;
            object.before = next.before;
            next.before = object;
            foundPlace = true;
            break;
          }
          current = next;
          next = current.after;
        }
      }
      if (foundPlace ) {
        if (object.addedToList) {
          object.addedToList();
        }
      }
      else {

        // Fell off end of list without finding requested location
        console.error("Dlist.insertBefore failed to find requested location");
      }
    };

    // Find an object in the list by its sequential position in the list.
    // Returns an object, or -1 if no such object.
    this.get = function(pos) {

      // Check that argument is a positive integer, return -1 if not
      if ((typeof pos !== "number") || (pos < 0)) {
         console.error("Dlist.get() called with invalid argument " + pos);
         return -1;
      }

      // Follow the list
      // NB: jshint doesn't seem to know about var in a for statement
      var index;
      var item;
      for (index = 0, item = this.first;
        item !== null;  index++, item = item.after) {
        if (index === pos) {
          return item;
        }
      }
      // Off the end of the list without finding the requested object
      console.error("Dlist.get() can't find " + pos + " in list");
      return -1;
    };

    // Insert an object after a member of a list
    this.insertAfter = function(object, afterThis) {
      var foundPlace = false;
      if (this.first === null) {

        // The list is now empty so this object is both first and last.
        this.first = this.last = object;
        foundPlace = true;
      }
      else if (afterThis === this.last) {

        // Adding to end of list
        afterThis.after = object;
        object.after = null;
        object.before = afterThis;
        this.last = object;
        foundPlace = true;
      }
      else {

        // Inserting object in the middle of the list
        var oldAfter = afterThis.after;
        object.after = oldAfter;
        afterThis.after = object;
        object.before = afterThis;
        oldAfter.before = object;
        foundPlace = true;
      }
      if (foundPlace ) {
        if (object.addedToList) {
          object.addedToList();
        }
      }
      else {

        // Fell off end of list without finding requested location
        console.error("Dlist.insertAfter failed to find requested location");
      }
    };

    // Add an object to the tail of the list
    this.append = function(member) {
      if (this.first === null) {

        // The list is now empty so this object is both first and last.
        this.first = this.last = member;
      }
      else {

        // The list is not empty.  Add this object to the tail of the list.
        var oldLast = this.last;
        if (oldLast !== null) {
          oldLast.after = member;
        }
        this.last = member;
        member.before = oldLast;
        member.after = null;
      }
      if (member.addedToList) {
        member.addedToList();
      }
    };

    // Prepend an object in front of the first element in the list
    this.prepend = function() {
      // FIXME
    };

    // Delete an object from the list
    this.delete = function(member) {
      if (member.before === null) {

        // Deleting the first object in the list
        this.first = member.after;
      }
      else {
         member.before.after = member.after;
      }
      if (member.after === null) {

        // Deleting the last object in the list
        this.last = member.before;
      }
      else {
         member.after.before = member.before;
      }
    };
  }

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
  function SnowProfileLayer(depth) {
    "use strict";

    // Reference this object inside an event handler
    var thisObj = this;

    // The SnowProfileLayer object before this one (above in the snow pack).
    // Points to a SnowProfileLayer or is null.
    this.before = null;

    // The SnowProfileLayer object after this one (below in the snow pack).
    // Points to a SnowProfileLayer or is null.
    this.after = null;

    // Depth of the top of this SnowProfileLayer in cm from the snow surface.
    // A non-negative number.
    this.depth = depth;

    // Hardness of this snow layer.
    // A string code from the CAAML_HARD table above.
    this.hardness = "F-";

    // Whether the user has touched the handle since layer was created
    this.handleTouched = false;

    // Handle for the line at the top of the layer.
    // The user drags and drops this handle to adjust depth and hardness.
    this.handle = new Kinetic.Rect({
      x: HANDLE_MIN_X,
      y: thisObj.depth2y(thisObj.depth),
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      offsetX: HANDLE_SIZE / 2,
      fill: '#000',
      draggable: true,
      dragBoundFunc: function(pos) {

        // X (hardness) position is bound by the edges of the graph.
        var newX = pos.x;
        if (pos.x < HANDLE_MIN_X) {
          newX = HANDLE_MIN_X;
        }
        else if (pos.x > HANDLE_MAX_X) {
          newX = HANDLE_MAX_X;
        }

        // Y (depth) position is limited by the depth of the snow layers
        // above and below in the snow pack, or by air and ground.
        var newY = pos.y;
        if (thisObj.before === null) {

          // This is the top (snow surface) layer.
          // Handle stays on the surface.
          newY = HANDLE_MIN_Y;
        }
        else if (thisObj.after === null) {

          // This is the bottom layer.  The handle depth is constrained
          // between the layer above and GRAPH_HEIGHT.
          if (pos.y > (HANDLE_MAX_Y)) {
            newY = HANDLE_MAX_Y;
          }
          else if (pos.y <= thisObj.before.handleGetY()) {
            newY = thisObj.before.handleGetY() + 1;
          }
        }
        else {

          // This layer is below the surface and above the bottom.
          // The handle depth is constrained between layers above and below.
            if (pos.y >= thisObj.after.handleGetY()) {
              newY = thisObj.after.handleGetY() - 1;
            }
            else if (pos.y <= thisObj.before.handleGetY()) {
              newY = thisObj.before.handleGetY() + 1;
            }
        }
        thisObj.depth = thisObj.y2depth(newY);
        return{
          x: newX,
          y: newY
        };
      }
    });

    // Return the current X position of the handle
    this.handleGetX = function() {
      return thisObj.handle.getX();
    };

    // Return the current Y position of the handle
    this.handleGetY = function() {
      return thisObj.handle.getY();
    };

    // Add text to show current handle location.
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
    });
    this.handle.on('mouseout', function() {
      document.body.style.cursor = 'default';
    });

    // When the handle is in use, show its location to the right.
    this.handle.on('mousedown', function() {
      thisObj.handle_loc.setVisible(1);
      thisObj.handleTouched = true;
      snow_profile_stage.draw();
    });
    this.handle.on('mouseup', function() {
      thisObj.handle_loc.setVisible(0);
      snow_profile_stage.draw();
    });
    layer.add(this.handle);

    // Points for a horizontal line from the Y axis to or through the handle.
    // The horizontal line extends from the left edge of the graph right to
    // the maximum of (X of this, X of snow layer above).
    this.horiz_line_pts = function() {
      var x = thisObj.handle.getX();
      if (thisObj.before !== null) {
          x = Math.max(x, thisObj.before.handleGetX());
      }
      return  [
        [DEPTH_LABEL_WD + 1,
         thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)],
        [x,
          thisObj.depth2y(thisObj.depth) + Math.floor(HANDLE_SIZE / 2)]
      ];
    };

    // Add a horizontal line at the top of the layer
    this.horiz_line = new Kinetic.Line({
      points: thisObj.horiz_line_pts(),
      stroke: '#000'
    });
    layer.add(this.horiz_line);

    // Points for vertical line from the handle down to the top of the layer
    // below in the snow pack, or the graph bottom if this is lowest layer.
    this.vert_line_pts = function() {
      var x = thisObj.handle.getX();
      var topY = thisObj.handle.getY() + (HANDLE_SIZE / 2);
      var bottomY = HANDLE_MAX_Y + (HANDLE_SIZE / 2);
      if (thisObj.after !== null) {
        bottomY = thisObj.after.handleGetY() + HANDLE_SIZE / 2;
      }
      return [[x, topY],[x, bottomY]];
    };

    // Add a vertical line to show hardness of the layer.  This line extends
    // from the handle down to the top of the layer below or graph bottom.
    this.vert_line = new Kinetic.Line({
      points: thisObj.vert_line_pts(),
      stroke: '#000'
    });
    layer.add(this.vert_line);

    // This layer has been added to the list.  Create a row for it
    // in the controls table.
    this.addedToList = function() {
      if (thisObj.before !== null) {
        var before = thisObj.before;
        before.vert_line.setPoints(before.vert_line_pts());
      }
      var ctrls_html = "<tr>" +
        "<td><button name=\"ia\">insert above</button></td>" +
        "<td><button name=\"ib\">insert below</button></td>" +
        "<td><button name=\"del\">delete</button></td>" +
        "</tr>";
      if (thisObj === snow_profile_layers.first) {

        // This layer is the new top of the snow pack
        $("#snow_profile_ctrls tbody:first-child").prepend(ctrls_html);

      } else if (thisObj === snow_profile_layers.last) {

        // This layer is the new lowest layer in the snow pack
        $("#snow_profile_ctrls tbody:last-child").append(ctrls_html);
      } else {

        // Count the number of layers above this in the snow pack
        var n = 0;
        var layer = snow_profile_layers.first;
        while (layer !== thisObj) {
          n++;
          layer = layer.after;
        }

        // This layer is the new nth layer in the snow pack.
        // The former nth layer is now the n+1st layer
        $("#snow_profile_ctrls tr").eq(n).before(ctrls_html);
      }
    };
    snow_profile_stage.draw();

    // Set handle visibility, if it is untouched
    this.setHandleVisible = function(visible) {
      if (!thisObj.handleTouched) {

        // The user hasn't touched this handle since it was inited, so blink
        thisObj.handle.setStroke(visible ? "#000" : "#FFF");
      }
      else {

        // The use has touched the handle so make it always visible
        thisObj.handle.setStroke("#000");
      }
      snow_profile_stage.draw();
    };

    // When the handle moves, recalculate the hardness value displayed
    // and redraw the lines connected to the handle
    this.handle.on('dragmove', function() {

      // Adjust the horizontal line
      thisObj.horiz_line.setPoints(thisObj.horiz_line_pts());

      // Adjust the vertical line
      thisObj.vert_line.setPoints(thisObj.vert_line_pts());

      // Adjust the horizontal line of the layer below, if any
      if (thisObj.after !== null) {
        var after = thisObj.after;
        after.horiz_line.setPoints(after.horiz_line_pts());
      }

      // Adjust the vertical line of the layer above, if any
      if (thisObj.before !== null) {
        var before = thisObj.before;
        before.vert_line.setPoints(before.vert_line_pts());
      }

     // Set the text information floating to the right of the graph
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
   */
  SnowProfileLayer.prototype.depth2y = function(depth) {
    "use strict";
    return (depth * (GRAPH_HEIGHT / MAX_DEPTH)) + HANDLE_MIN_Y;
  };

  /**
   * Convert a Y axis position to a depth in cm
   * NB: assumes snow surface at Y == 0.
   */
  SnowProfileLayer.prototype.y2depth = function(y) {
    "use strict";
    return ((y - HANDLE_MIN_Y) / GRAPH_HEIGHT) * MAX_DEPTH;
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

      // Draw the vertical line along the left edge
    layer.add(new Kinetic.Line({
      points: [
        [DEPTH_LABEL_WD, HANDLE_MIN_Y - 1 + (HANDLE_SIZE / 2)],
        [DEPTH_LABEL_WD, HANDLE_MAX_Y + (HANDLE_SIZE / 2)]
      ],
      stroke: LABEL_COLOR,
      strokeWidth: 1
    }));

    // Add text every 20 cm to the depth label area
    for (var cm = 0; cm <= MAX_DEPTH; cm += 20) {
      layer.add(new Kinetic.Text({
        x: 10,
        y: HANDLE_MIN_Y + cm * DEPTH_SCALE,
        text: cm,
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        fill: LABEL_COLOR,
        align: 'right'
      }));

      // Draw a horizontal line every 20 cm as a depth scale
      if (cm !== MAX_DEPTH) {
        layer.add(new Kinetic.Line({
          points: [
            [DEPTH_LABEL_WD + 1,
              HANDLE_MIN_Y + (HANDLE_SIZE / 2) + (cm * DEPTH_SCALE)],
            [DEPTH_LABEL_WD + 1 + GRAPH_WIDTH - HANDLE_SIZE / 2,
              HANDLE_MIN_Y + (HANDLE_SIZE / 2) + (cm * DEPTH_SCALE)]
          ],
          stroke: GRID_COLOR,
          strokeWidth: 1
        }));
      }
    }

    // Draw and label the hardness (horizontal) axis
    layer.add(new Kinetic.Line({
      points: [
        [DEPTH_LABEL_WD,
          HANDLE_MAX_Y + (HANDLE_SIZE / 2)],
        [DEPTH_LABEL_WD + GRAPH_WIDTH +1 - HANDLE_SIZE / 2,
          HANDLE_MAX_Y + (HANDLE_SIZE / 2)]
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
            [x, HANDLE_MIN_Y + (HANDLE_SIZE / 2)],
            [x, HANDLE_MAX_Y + (HANDLE_SIZE / 2)]
          ],
          stroke: GRID_COLOR,
          strokeWidth: 1
        }));
        layer.add(new Kinetic.Text({
          x: x,
          y: HANDLE_MAX_Y + 10,
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

    // add the layer to the stage
    snow_profile_stage.add(layer);

    // Create an animation
    var anim = new Kinetic.Animation(function(frame) {
      this.showHandle = (frame.time % 1000) > 500;
      if (this.oldShowHandle === undefined) {
          this.oldShowHandle = this.showHandle;
      }
      else {
        if (this.showHandle !== this.oldShowHandle) {
          this.oldShowHandle = this.showHandle;

          // For each snow layer, if handle untouched, blink
          var current = snow_profile_layers.first;
          while (current !== null) {
            current.setHandleVisible(this.showHandle);
            current = current.after;
          }
        }
      }


    });
    anim.start();

    // Listen to all buttons now and future in the controls table
    $("#snow_profile_ctrls").delegate("button", "click",
      function(){
        var row = $("#snow_profile_ctrls tr").index(this.parentNode.parentNode);
        var item = snow_profile_layers.get(row);
        if (item === -1) {
          return;
        }
        var name = this.name;
          switch (name) {
          case "ia":
            snow_profile_layers.insertBefore(new SnowProfileLayer(40),
              item);
            break;

          case "ib":
            snow_profile_layers.insertAfter(new SnowProfileLayer(40),
              item);
            break;

          case "del":
            snow_profile_layers.delete(item);
            break;

          default:
            console.error("click from button with unknown name " + name);
          }
      });
}  // function snow_profile_init();

  /**
   * Main program
   */
  snow_profile_init();
  snow_profile_layers.append(new SnowProfileLayer(0));

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// c-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
