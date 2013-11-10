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
     * Maximum snow depth in cm that can be plotted on the graph.
     *
     * Snow depth in cm that corresponds to GRAPH_HEIGHT pixels.
     * Zero depth always corresponds to zero graph pixels.
     * @const
     */
    MAX_DEPTH:  200
  };

  /**
   * Central x of the data plotting area.
   * @const
   */
  SnowProfile.GRAPH_CENTER_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.GRAPH_WIDTH / 2);

  /**
   * Maximum x value allowed for a handle (hardness 'I').
   * @const
   */
  SnowProfile.HANDLE_MAX_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH - (SnowProfile.HANDLE_SIZE / 2);

  /**
   * Minimum x value allowed for a handle (hardness 'F-').
   * @const
   */
  SnowProfile.HANDLE_MIN_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.HANDLE_SIZE / 2);

  /**
   * Minimum Y value allowed for a handle (top of graph area)
   * @const
   */
  SnowProfile.HANDLE_MIN_Y = SnowProfile.TEMP_LABEL_HT + 1;

  /**
   * Maximum Y value allowed for any handle (bottom of graph area)
   * @const
   */
  SnowProfile.HANDLE_MAX_Y = SnowProfile.TEMP_LABEL_HT + 1 +
    SnowProfile.GRAPH_HEIGHT;

  /**
   * Width in pixels of one hardness band in the CAAML_HARD table
   *
   * Calculation depends on knowing there are 21 entries in the table
   * @const
   */
  SnowProfile.HARD_BAND_WD = (SnowProfile.GRAPH_WIDTH -
    SnowProfile.HANDLE_SIZE) / 20;

  /**
   * Table of CAAML hardness values (HardnessBaseEnumType).
   *
   * CAAML_HARD[i][0] is the alpha string defined by CAAML 5.0.
   * CAAML_HARD[i][1] is a boolean; whether to draw a line here.
   * CAAML_HARD[i][2] minimum x value having SnowProfile hardness.  The
   * maximum x value for SnowProfile hardness is one less than the minimum for
   * the next row.
   * @const
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
   */
   SnowProfile.STAGE_HT =  SnowProfile.TEMP_LABEL_HT + 1 +
     SnowProfile.GRAPH_HEIGHT + 1 + SnowProfile.HARD_LABEL_HT;

  /**
   * Horizontal width in pixels of the KineticJS stage
   * @const
   */
   SnowProfile.STAGE_WD = SnowProfile.DEPTH_LABEL_WD + 1 +
     SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD;

  /**
   * Depth scale in pixels per cm
   * @const
   */
  SnowProfile.DEPTH_SCALE = SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH;
})();

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

    // Insert an object before a member of SnowProfile list
    this.insertBefore = function(object, beforeSnowProfile) {
      //console.debug("insertBefore has been called");
      var foundPlace = false;
      if (this.first === null) {

        // The list is now empty so SnowProfile object is both first and last.
        this.first = this.last = object;
        foundPlace = true;
      }
      else if (this.first === beforeSnowProfile) {

        // Inserting before the first element in the list
        object.after = this.first;
        object.before = null;
        this.first = object;
        foundPlace = true;
      }
      else {

        // Inserting before some element farther in list
        //console.debug("insertBefore layer at "+beforethis.depth);
        var current = this.first;
        var next = current.after;
        var n = 0;
        while (next !== null) {
          if (next === beforeSnowProfile) {

            // Inserting before the next member of the list
            object.after = next;
            object.before = next.before;
            next.before = object;
            current.after = object;
            foundPlace = true;
            //console.debug("found match at layer " + n);
            break;
          }
          current = next;
          next = current.after;
          n++;
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

        // The list is now empty so SnowProfile object is both first and last.
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
    this.append = function(object) {
      if (this.first === null) {

        // The list is now empty so SnowProfile object is both first and last.
        this.first = this.last = object;
      }
      else {

        // The list is not empty.  Add SnowProfile object to the tail of the list.
        var oldLast = this.last;
        if (oldLast !== null) {
          oldLast.after = object;
        }
        this.last = object;
        object.before = oldLast;
        object.after = null;
      }

      // Let the object know it has been added to the list
      if (object.addedToList) {
        object.addedToList();
      }
    };

    // Prepend an object in front of the first element in the list
    this.prepend = function() {
      // FIXME
    };

    // Delete an object from the list
    this.delete = function(object) {
      //console.debug("delete() called");
      // Let the object know it will be deleted from the list
      if (object.deleteFromList) {
        object.deleteFromList();
      }
      if (object.before === null) {

        // Deleting the first object in the list
        //console.debug("deleting first object");
        this.first = object.after;
      }
      else {
         object.before.after = object.after;
      }
      if (object.after === null) {

        // Deleting the last object in the list
        //console.debug("deleting last object");
        this.last = object.before;
      }
      else {
        object.after.before = object.before;
      }
    };
  }

  /**
   * Snow stratigraphy snow layers
   * NB: The KineticJS library refers to a visual layer of the diagram
   *     as a "layer" so be careful which type of layer is meant!
   */
  var snow_profile_layers = new Dlist();

  // only KineticJS layer at SnowProfile moment
  var layer;

  /**
   * Object describing a single snow stratigraphy layer
   *
   * Note that drawing the snow layer depends on knowing the layers above
   * and below in the snow pack.  In the constructor we don't know SnowProfile,
   * so we need to wait until the layer is added to the snow_layer_list
   * before we can draw it.
   * @constructor
   */
  function SnowProfileLayer(depth) {
    "use strict";

    // Reference SnowProfile object inside an event handler
    var that = this;

    // The SnowProfileLayer object before SnowProfile one (above in the snow pack).
    // Points to a SnowProfileLayer or is null.
    this.before = null;

    // The SnowProfileLayer object after this one (below in the snow pack).
    // Points to a SnowProfileLayer or is null.
    this.after = null;

    // Depth of the top of this SnowProfileLayer in cm from the snow surface.
    // A non-negative number.
    this.depth = depth;

    // Hardness of SnowProfile snow layer.
    // A string code from the CAAML_HARD table above.
    this.hardness = "F-";

    // Whether the user has touched the handle since layer was created
    this.handleTouched = false;

    // Handle for the line at the top of the layer.
    // The user drags and drops SnowProfile handle to adjust depth and hardness.
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
        if (that.before === null) {

          // SnowProfile is the top (snow surface) layer.
          // Handle stays on the surface.
          newY = SnowProfile.HANDLE_MIN_Y;
        }
        else if (that.after === null) {

          // SnowProfile is the bottom layer.  The handle depth is constrained
          // between the layer above and GRAPH_HEIGHT.
          if (pos.y > (SnowProfile.HANDLE_MAX_Y)) {
            newY = SnowProfile.HANDLE_MAX_Y;
          }
          else if (pos.y <= that.before.handleGetY()) {
            newY = that.before.handleGetY() + 1;
          }
        }
        else {

          // SnowProfile layer is below the surface and above the bottom.
          // The handle depth is constrained between layers above and below.
            if (pos.y >= that.after.handleGetY()) {
              newY = that.after.handleGetY() - 1;
            }
            else if (pos.y <= that.before.handleGetY()) {
              newY = that.before.handleGetY() + 1;
            }
        }
        that.depth = that.y2depth(newY);
        return{
          x: newX,
          y: newY
        };
      }
    });

    // Return the current X position of the handle
    this.handleGetX = function() {
      return that.handle.getX();
    };

    // Return the current Y position of the handle
    this.handleGetY = function() {
      return that.handle.getY();
    };

    // Add text to show current handle location.
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
    layer.add(this.handle_loc);

    // Style the cursor for the handle
    this.handle.on('mouseover', function() {
      document.body.style.cursor = 'pointer';
    });
    this.handle.on('mouseout', function() {
      document.body.style.cursor = 'default';
    });

    // When the handle is in use, show its location to the right.
    this.handle.on('mousedown', function() {
      that.handle_loc.setVisible(1);
      that.handleTouched = true;
      snow_profile_stage.draw();
    });
    this.handle.on('mouseup', function() {
      that.handle_loc.setVisible(0);
      snow_profile_stage.draw();
    });
    layer.add(this.handle);

    // Points for a horizontal line from the Y axis to or through the handle.
    // The horizontal line extends from the left edge of the graph right to
    // the maximum of (X of SnowProfile, X of snow layer above).
    this.horiz_line_pts = function() {
      var x = that.handle.getX();
      if (that.before !== null) {
          x = Math.max(x, that.before.handleGetX());
      }
      return  [
        [SnowProfile.DEPTH_LABEL_WD + 1,
         that.depth2y(that.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)],
        [x,
          that.depth2y(that.depth) + Math.floor(SnowProfile.HANDLE_SIZE / 2)]
      ];
    };

    // Add a horizontal line at the top of the layer
    this.horiz_line = new Kinetic.Line({
      points: that.horiz_line_pts(),
      stroke: '#000'
    });
    layer.add(this.horiz_line);

    // Points for vertical line from the handle down to the top of the layer
    // below in the snow pack, or the graph bottom if SnowProfile is lowest layer.
    this.vert_line_pts = function() {
      var x = that.handle.getX();
      var topY = that.handle.getY() + (SnowProfile.HANDLE_SIZE / 2);
      var bottomY = SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2);
      if (that.after !== null) {
        bottomY = that.after.handleGetY() + SnowProfile.HANDLE_SIZE / 2;
      }
      return [[x, topY],[x, bottomY]];
    };

    // Add a vertical line to show hardness of the layer.  SnowProfile line extends
    // from the handle down to the top of the layer below or graph bottom.
    this.vert_line = new Kinetic.Line({
      points: that.vert_line_pts(),
      stroke: '#000'
    });
    layer.add(this.vert_line);

    // SnowProfile layer has been added to the list.  Create a row for it
    // in the controls table.
    this.addedToList = function() {
      if (that.before !== null) {
        var before = that.before;
        before.vert_line.setPoints(before.vert_line_pts());
      }
      var ctrls_html = "<tr>" +
        "<td><button name=\"ia\">insert above</button></td>" +
        "<td><button name=\"ib\">insert below</button></td>" +
        "<td><button name=\"del\">delete</button></td>" +
        "</tr>";
      if (that === snow_profile_layers.first) {

        // SnowProfile layer is the new top of the snow pack
        $("#snow_profile_ctrls tbody:first-child").prepend(ctrls_html);
        //console.debug("new layer is new top");

      } else if (that === snow_profile_layers.last) {

        // SnowProfile layer is the new lowest layer in the snow pack
        $("#snow_profile_ctrls tbody:last-child").append(ctrls_html);
        //console.debug("new layer is new bottom");
      } else {

        // Count the number of layers above SnowProfile in the snow pack
        var n = 0;
        var snowLayer = snow_profile_layers.first;
        while (snowLayer !== that) {
          n++;
          if (snowLayer !== null) {
            snowLayer = snowLayer.after;
          }
          else {
            break;
          }
        }
        // FIXME deal with layer not found situation
      }
      snow_profile_stage.draw();
    };

    // SnowProfile object will be deleted from the list.  Delete its row from the
    // controls table.  If only one object remains on the list, disable that
    // object's delete button.
    this.deleteFromList = function() {
      //console.debug("deleteFromList() called");
      // Count the number of layers above SnowProfile in the snow pack
      var n = 0;
      var snowLayer = snow_profile_layers.first;
      while (snowLayer !== that) {
        n++;
        if (snowLayer !== null) {
          snowLayer = snowLayer.after;
        }
        else {
          break;
        }
      }
      if (snowLayer !== that) {
        console.error("deleteFromList can't find SnowProfile object in the list");
      }
      else {
        $("#snow_profile_ctrls tr").eq(n).remove();
        if (snowLayer === snow_profile_layers.first) {
          // We're deleting the top layer, so the next layer is now top
          //console.debug("deleting top layer so layer after gets depth = 0");
          that.after.setDepth(0);
        }
      }

      // Destroy the object and its components
      that.handle.destroy();
        delete that.handle;
      that.handle_loc.destroy();
        delete that.handle_loc;
      that.vert_line.destroy();
        delete that.vert_line;
      that.horiz_line.destroy();
        delete that.horiz_line;
      layer.clearCache();
    };

    // Draw the layer from depth and hardness values and adjacent layers
    this.draw = function() {

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
      if (that.after !== null) {
        var after = that.after;
        after.horiz_line.setPoints(after.horiz_line_pts());
      }

      // Adjust the vertical line of the layer above, if any
      if (that.before !== null) {
        var before = that.before;
        before.vert_line.setPoints(before.vert_line_pts());
      }
      snow_profile_stage.draw();
    };

    // Set the depth of the layer and draw
    this.setDepth = function(depth) {
      that.depth = depth;
      that.draw();
    };

    // Set handle visibility, if it is untouched
    this.setHandleVisible = function(visible) {
      if (!that.handleTouched) {

        // The user hasn't touched SnowProfile handle since it was inited, so blink
        that.handle.setStroke(visible ? "#000" : "#FFF");
      }
      else {

        // The use has touched the handle so make it always visible
        that.handle.setStroke("#000");
      }
      snow_profile_stage.draw();
    };

    // When the handle moves, recalculate the hardness value displayed
    // and draw the lines connected to the handle
    this.handle.on('dragmove', function() {

      // Adjust the horizontal (hardness) position
      that.hardness = that.x2code(that.handle.getX());
      that.horiz_line.setPoints(that.horiz_line_pts());

      // Adjust the vertical (depth) position
      that.depth = that.y2depth(that.handle.getY());
      that.vert_line.setPoints(that.vert_line_pts());

      // Adjust the horizontal line of the layer below, if any
      if (that.after !== null) {
        var after = that.after;
        after.horiz_line.setPoints(after.horiz_line_pts());
      }

      // Adjust the vertical line of the layer above, if any
      if (that.before !== null) {
        var before = that.before;
        before.vert_line.setPoints(before.vert_line_pts());
      }

     // Set the text information floating to the right of the graph
      var mm = Math.round(that.depth * 10) / 10;
      that.handle_loc.setText( '(' + mm + ', ' +
        that.x2code(that.handle.getX()) + ')');
      that.handle_loc.setY(that.depth2y(that.depth));
    });
  } // function SnowProfileLayer()

  /**
   * Convert a hardness code to an X axis position
   */
  SnowProfileLayer.prototype.code2x = function(code) {
    "use strict";
    var x = SnowProfile.HANDLE_MIN_X;
    for (var i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      if (code === SnowProfile.CAAML_HARD[i][0]) {
        x = SnowProfile.CAAML_HARD[i][2] + SnowProfile.HARD_BAND_WD * 0.5;
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
   * Convert a depth in cm to a Y axis position
   *
   * Y axis scale is max depth of snow / graph height in pixels
   */
  SnowProfileLayer.prototype.depth2y = function(depth) {
    "use strict";
    return (depth * (SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH)) + SnowProfile.HANDLE_MIN_Y;
  };

  /**
   * Convert a Y axis position to a depth in cm
   * NB: assumes snow surface at Y == 0.
   */
  SnowProfileLayer.prototype.y2depth = function(y) {
    "use strict";
    return ((y - SnowProfile.HANDLE_MIN_Y) / SnowProfile.GRAPH_HEIGHT) * SnowProfile.MAX_DEPTH;
  };

  /**
   * Initialize the container and the grid layer
   */
  function snow_profile_init() {
    "use strict";
    snow_profile_stage = new Kinetic.Stage({
      container: 'snow_profile_diagram',
      width: SnowProfile.STAGE_WD,
      height: SnowProfile.STAGE_HT
    });

    // Create the reference grid layer
    layer = new Kinetic.Layer();

      // Draw the vertical line along the left edge
    layer.add(new Kinetic.Line({
      points: [
        [SnowProfile.DEPTH_LABEL_WD, SnowProfile.HANDLE_MIN_Y - 1 + (SnowProfile.HANDLE_SIZE / 2)],
        [SnowProfile.DEPTH_LABEL_WD, SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)]
      ],
      stroke: SnowProfile.LABEL_COLOR,
      strokeWidth: 1
    }));

    // Add text every 20 cm to the depth label area
    for (var cm = 0; cm <= SnowProfile.MAX_DEPTH; cm += 20) {
      layer.add(new Kinetic.Text({
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
        layer.add(new Kinetic.Line({
          points: [
            [SnowProfile.DEPTH_LABEL_WD + 1,
              SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) + (cm * SnowProfile.DEPTH_SCALE)],
            [SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH - SnowProfile.HANDLE_SIZE / 2,
              SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) + (cm * SnowProfile.DEPTH_SCALE)]
          ],
          stroke: SnowProfile.GRID_COLOR,
          strokeWidth: 1
        }));
      }
    }

    // Draw and label the hardness (horizontal) axis
    layer.add(new Kinetic.Line({
      points: [
        [SnowProfile.DEPTH_LABEL_WD,
          SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)],
        [SnowProfile.DEPTH_LABEL_WD + SnowProfile.GRAPH_WIDTH +1 - SnowProfile.HANDLE_SIZE / 2,
          SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)]
      ],
      stroke: SnowProfile.LABEL_COLOR,
      strokeWidth: 1
    }));

    // Iterate through the table of CAAML hardness codes to
    // build the hardness (horizontal) scale for the graph area
    for (var i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      var x = SnowProfile.DEPTH_LABEL_WD + 1 + (SnowProfile.HARD_BAND_WD * i) + (SnowProfile.HANDLE_SIZE / 2);
      if (SnowProfile.CAAML_HARD[i][1]) {

        // Add a vertical line to show SnowProfile hardness value
        layer.add(new Kinetic.Line({
          points: [
            [x, SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)],
            [x, SnowProfile.HANDLE_MAX_Y + (SnowProfile.HANDLE_SIZE / 2)]
          ],
          stroke: SnowProfile.GRID_COLOR,
          strokeWidth: 1
        }));
        layer.add(new Kinetic.Text({
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
        var newLayer = new SnowProfileLayer(40);
          switch (name) {
          case "ia":
            snow_profile_layers.insertBefore(newLayer, item);
            newLayer.draw();
            break;

          case "ib":
            snow_profile_layers.insertAfter(newLayer, item);
            newLayer.draw();
            break;

          case "del":
            //console.debug("delete row "+row);
            var before = item.before;
            var after = item.after;
            snow_profile_layers.delete(item);
            if (before !== null) {
              before.draw();
            }
            if (after !== null) {
              after.draw();
            }
            item = null;

            // Check how many layers remain in the list.  If there is only one
            // remaining, we can't allow it to be deleted
            if (snow_profile_layers.first.after === null) {
              $("#snow_profile_ctrls button[name=\"del\"]").attr("disabled", "disabled");
            }
            snow_profile_stage.draw();
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
