/**
 * @file Defines the namespace and configuration for the snow profile editor.
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SVG */

/**
 * The svg.js library
 * @external SVG
 * @see {@link http://http://documentup.com/wout/svg.js svg.js}
 */

/**
 * Constants and common functions
 * @type {object}
 * @namespace
 */
var SnowProfile = {};

/**
 * Layout of the snow profile SVG drawing:
 *
 *       | Top Labels
 * ___________________________________________________________________
 *       |             |          |       | |       |
 * Depth |             |          | Grain | | Grain |
 * Label | Graph       | Controls | Shape | | Size  | Comment
 *       |             |          |       | |       |
 *____________________________________________________________________
 *       | Hardness    |
 *       | Label       |
 */
(function() {
  "use strict";

  SnowProfile.Cfg = {

    /**
     * Maximum snow depth in cm that can be plotted on the graph.
     * @const {number}
     * @memberof SnowProfile
     * @see SnowProfile.Grid~depthScaleGrp
     */
    MAX_DEPTH: 300,

    /**
     * Minimum snow depth in cm that can be set by the user.
     * @const {number}
     * @memberof SnowProfile
     * @see SnowProfile.Grid~depthScaleGrp
     */
    MIN_DEPTH: 50,

    /**
     * Default snow pit depth in cm
     * @const {number}
     * @memberof SnowProfile
     * @see SnowProfile.Grid~depthScaleGrp
     */
   DEFAULT_PIT_DEPTH: 150,

    /**
     * Horizontal width in pixels of the depth (vertical) axis label.
     * @const {number}
     * @memberof SnowProfile
     * @see SnowProfile.Grid~depthScaleGrp
     */
    DEPTH_LABEL_WD: 70,

    /**
     * Depth interval in cm between horizontal grid lines
     * @memberof SnowProfile
     * @const {number}
     */
    DEPTH_LINE_INT: 10,

    /**
     * Width in pixels available for plotting data.
     * @memberof SnowProfile
     * @const {number}
     */
    GRAPH_WIDTH: 350,

    /**
     * Width in pixels of the area used by buttons and
     * connectors (diagonal lines).
     * @memberof SnowProfile
     * @const {number}
     */
    CTRLS_WD: 200,

    /**
     * Width in pixels of the area used by snow grain shape
     * @memberof SnowProfile
     * @const {number}
     */
    GRAIN_SHAPE_WD: 60,

    /**
     * Width in pixels of the space between grain shape and size
     * @memberof SnowProfile
     * @const {number}
     */
    GRAIN_SPACE_WD: 5,

    /**
     * Width in pixels of the area used by snow grain size
     * @memberof SnowProfile
     * @const {number}
     */
    GRAIN_SIZE_WD: 50,

    /**
     * Width in pixels of the space between grain size and comment
     * @memberof SnowProfile
     * @const {number}
     */
    COMMENT_SPACE_WD: 5,

    /**
      Width in pixels of the area used by snow layer comment
     * @memberof SnowProfile
      @const {number}
     */
    COMMENT_WD: 200,

    /**
     * Vertical height in pixels of the temperature (horizontal) axis label.
     * @memberof SnowProfile
     * @const {number}
     */
    TOP_LABEL_HT: 40,

    /**
     * Minimum height in pixels of the features area for one snow layer.
     * @memberof SnowProfile
     * @const {number}
     */
    DESCR_HEIGHT: 40,

    /**
     * Vertical height in pixels of the hardness (horizontal) axis label.
     * @memberof SnowProfile
     * @const {number}
     */
    HARD_LABEL_HT: 60,

    /**
     * Size in pixels of the handle square
     * @memberof SnowProfile
     * @const {number}
     */
    HANDLE_SIZE: 11,

    /**
     * Color of the background of the graph
     * @memberof SnowProfile
     * @const {string}
     */
    BACKGROUND_COLOR: '#fdfdfd',

    /**
     * Color of the labels and axis lines
     * @memberof SnowProfile
     * @const {string}
     */
     LABEL_COLOR: '#003390',

    /**
     * Color of the chart grid
     * @memberof SnowProfile
     * @const {string}
     */
    GRID_COLOR: '#69768C',

    /**
      Depth scale in pixels per cm
      @const {number}
      @memberof SnowProfile
     */
    DEPTH_SCALE: 5,

    /**
     * Number of layers initially shown on a fresh copy of the page.
     */
    NUM_INIT_LAYERS: 3,

    /**
     * Depth interval in cm of layers initially shown on a
     * fresh copy of the page.
     */
    INT_INIT_LAYERS: 20,

    /**
     * Width in pixels of the image to be generated
     * @memberof SnowProfile
     * @const {number}
     */
    IMAGE_WD: 800
  }; // SnowProfile.Cfg = {

  /**
   * Pit depth (cm)
   *
   * Maximum depth of the pit in cm from the snow surface.  Must
   * be an integer between MIN_DEPTH and MAX_DEPTH. Default MAX_DEPTH.
   * @type {!number}
   * @see SnowProfile.Grid~depthScaleGrp
   */
  SnowProfile.pitDepth = SnowProfile.Cfg.DEFAULT_PIT_DEPTH;

    /**
     * Total depth of the snow pack (cm)
     *
     * Distance in cm from the snow surface to the ground, as measured
     *   with a calibrated probe or by digging to the ground.  Null
     *   if this distance is not known.
     * @memberof SnowProfile
     * @type {?number}
     */
  SnowProfile.totalDepth = null;

    /**
     * Maximum Y value allowed for any handle (bottom of graph area)
     *
     * @type {number}
     * @memberof SnowProfile
     * @see SnowProfile.Grid~adjustGrid
     */
  SnowProfile.handleMaxY = null;

    /**
     * Depth reference (snow surface or ground)
     *
     * A single letter indicating whether snow depth is referenced
     * to the snow surface ("s") or ground ("g").  Must be one or the
     * other.  Default is "s".  Ground reference may be used only if
     * the value of total snow depth (totalDepth) is known.
     * @memberof SnowProfile
     * @type {!string}
     * @see SnowProfile.Grid~depthScaleGrp
     */
  SnowProfile.depthRef = "s";

  /**
   * Depth increment in cm to allow when inserting a layer above
   * or below another layer.
   * @memberof SnowProfile
   * @const {number}
   */
  SnowProfile.Cfg.INS_INCR = (SnowProfile.Cfg.HANDLE_SIZE + 1) /
    SnowProfile.Cfg.DEPTH_SCALE;

  /**
   * Central x of the data plotting area.
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.GRAPH_CENTER_X = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    (SnowProfile.Cfg.GRAPH_WIDTH / 2);

  /**
   * Maximum x value allowed for a handle (hardness 'I').
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.HANDLE_MAX_X = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    SnowProfile.Cfg.GRAPH_WIDTH - (SnowProfile.Cfg.HANDLE_SIZE / 2);

  /**
   * Minimum x value allowed for a handle (hardness 'F-').
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.HANDLE_MIN_X = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    (SnowProfile.Cfg.HANDLE_SIZE / 2);

  /**
   * Minimum Y value allowed for a handle (top of graph area)
   *
   * @const
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.HANDLE_MIN_Y = SnowProfile.Cfg.TOP_LABEL_HT + 1;

  /**
   * Width in pixels of one hardness band in the CAAML_HARD table
   *
   * Calculation depends on knowing there are 21 entries in the table
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.HARD_BAND_WD = (SnowProfile.Cfg.GRAPH_WIDTH -
    SnowProfile.Cfg.HANDLE_SIZE) / 20;

  /**
   * Horizontal width in pixels of the SVG drawing
   *
   * @const {number}
   * @memberof SnowProfile
   */
   SnowProfile.Cfg.DRAWING_WD = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
     SnowProfile.Cfg.GRAPH_WIDTH + 1 + SnowProfile.Cfg.CTRLS_WD + 1 +
     SnowProfile.Cfg.GRAIN_SHAPE_WD + SnowProfile.Cfg.GRAIN_SPACE_WD +
     SnowProfile.Cfg.GRAIN_SIZE_WD + SnowProfile.Cfg.COMMENT_SPACE_WD +
     SnowProfile.Cfg.COMMENT_WD;

  /**
   * Initial X position of the layer handle
   *
   * This X position centers the handle over the left edge of the grid, which
   * is farther left than the user can move it.
   */
  SnowProfile.Cfg.HANDLE_INIT_X = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 -
    (SnowProfile.Cfg.HANDLE_SIZE / 2);

  /**
   * X position of the center line of the buttons in the control area
   */
  SnowProfile.Cfg.BUTTON_X = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    SnowProfile.Cfg.GRAPH_WIDTH + 150;

  /**
   * X position of the left edge of the layer description
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.FEAT_DESCR_LEFT = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    SnowProfile.Cfg.GRAPH_WIDTH + 1 + SnowProfile.Cfg.CTRLS_WD;

  SnowProfile.Cfg.FEAT_DESCR_WD = SnowProfile.Cfg.GRAIN_SHAPE_WD +
    SnowProfile.Cfg.GRAIN_SPACE_WD + SnowProfile.Cfg.GRAIN_SIZE_WD +
    SnowProfile.Cfg.COMMENT_SPACE_WD + SnowProfile.Cfg.COMMENT_WD;


  /**
   * X position of the left edge of the Grain icons area
   * within the layer description group
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.GRAIN_ICON_LEFT = 0;

  /**
   * X position of the left edge of the Grain size area
   * within the layer description group
   *
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.GRAIN_SIZE_LEFT = SnowProfile.Cfg.GRAIN_ICON_LEFT +
    SnowProfile.Cfg.GRAIN_SHAPE_WD + SnowProfile.Cfg.GRAIN_SPACE_WD;

  /**
   * X position of the left edge of the Comment text area
   * @const {number}
   * @memberof SnowProfile
   */
  SnowProfile.Cfg.COMMENT_LEFT = SnowProfile.Cfg.GRAIN_SIZE_LEFT +
    SnowProfile.Cfg.GRAIN_SIZE_WD + SnowProfile.Cfg.COMMENT_SPACE_WD;

  /**
   * Snow stratigraphy snow layers.
   *
   * The SnowProfile.Layer objects are referenced by this array which is
   * ordered by the depth of the layer.  The top layer(depth == 0) is always
   * referenced by snowLayers[0].  When a Layer object is created or
   * removed, it is spliced into the array so that the order of depths is
   * maintained, and the indexes of the layers below increment by 1.  When
   * the depth of a layer is changed by the user, the new depth is
   * constrained to be less than the depth of the layer above and more than
   * the depth of the layer below in the snow pack.
   * @memberof SnowProfile
   * @type {Array.<SnowProfile.Layer>}
   */
  SnowProfile.snowLayers = [];

  /**
   * Make the handle visible if it has not been touched.
   * @memberof SnowProfile
   * @type {boolean}
   */
  SnowProfile.showHandle = null;

  /**
   * Previous state of showHandle.
   * @memberof SnowProfile
   * @type {boolean}
   */
  SnowProfile.oldShowHandle = null;

  /**
   * Vertical height in pixels of the grid (left side) of the SVG drawing.
   *
   * This height is the pixel equivalent of the pit depth set by the user,
   * plus the height of the various labels.
   * @method
   * @memberof SnowProfile
   * @returns {number} Drawing height in pixels.
   */
  SnowProfile.gridHeight = function() {
    return  SnowProfile.Cfg.TOP_LABEL_HT + 1 + (SnowProfile.pitDepth *
      SnowProfile.Cfg.DEPTH_SCALE) + 1 + SnowProfile.Cfg.HARD_LABEL_HT;
  };

  /**
   * Vertical height in pixels of the features (right side) of the drawing.
   *
   * This height is the sum of the pixel heights of the features of each
   * snow layer.
   * @method
   * @memberof SnowProfile
   * @returns {number} Drawing height in pixels.
   */
  SnowProfile.featuresHeight = function() {

    var i,
      sum = SnowProfile.Cfg.TOP_LABEL_HT + 1 + SnowProfile.Cfg.DESCR_HEIGHT;
    for (i = 0; i < SnowProfile.snowLayers.length; i++) {
      sum += SnowProfile.snowLayers[i].features().height;
    }
    return sum;
  };

  /**
   * Vertical height in pixels of the SVG drawing
   *
   * @method
   * @memberof SnowProfile
   * @returns {number} Drawing height in pixels.
   */
  SnowProfile.setDrawingHeight = function() {
    var max = Math.max(SnowProfile.gridHeight(), SnowProfile.featuresHeight());
    SnowProfile.drawing.size(SnowProfile.Cfg.DRAWING_WD, max);
    SnowProfile.diagram.setAttribute('height', max + 10);
  };

  /**
   * SVG drawing
   *
   * @see  {@link http://http://documentup.com/wout/svg.js#usage/create-a-svg-document Create a SVG document}
   * @type {Object}
   * @memberof SnowProfile
   */
  SnowProfile.diagram = document.getElementById('snow_profile_diagram');
  SnowProfile.drawing = SVG("snow_profile_diagram");
  SnowProfile.diagram.setAttribute('width', SnowProfile.Cfg.DRAWING_WD + 10);
  SnowProfile.mainGroup = SnowProfile.drawing.group()
    .attr('id', 'snow_profile_main_g');

  // For debugging, show the bounding box
  // SnowProfile.drawingBox = SnowProfile.drawing.rect(0, 0)
  //   .style({
  //      "fill-opacity": 0,
  //      stroke: 'red'
  //   });
  // SnowProfile.mainGroup.add(SnowProfile.drawingBox);

  /**
   * SnowProfile drawing grid group
   *
   * This SVG group holds the grid to which the snow layers are referenced.
   * Whenever the pit depth or total snow depth are changed by the user, this
   * group is cleared and recreated.
   * @see  {@link http://http://documentup.com/wout/svg.js#parent-elements/groups Groups}
   * @type {object}
   * @memberof SnowProfile
   */
  SnowProfile.gridGroup = SnowProfile.drawing.group()
    .addClass("snow_profile_grid");
  SnowProfile.mainGroup.add(SnowProfile.gridGroup);

  /**
   * Recalculate the Y axis positions of all SVG objects whose
   * position depends on the index of the layer in the snowpack.
   *
   * @method
   * @memberof SnowProfile
   */
  SnowProfile.setIndexPositions = function() {
    var i,
      numLayers = SnowProfile.snowLayers.length;

    for (i = 0; i < numLayers; i++) {
      SnowProfile.snowLayers[i].setIndexPosition();
    }
  };

  /**
   * Convert a hardness code to an X axis position.
   * @param {string} code A CAAML hardness code from the CAAML_HARD table.
   * @returns {number} X axis position
   */
  SnowProfile.code2x = function(code) {
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
   * Convert an X axis position to a hardness code
   * @param {number} x X axis position.
   * @returns {string} CAAML hardness code.
   */
  SnowProfile.x2code = function(x) {
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
   * Convert a Y axis position to a depth in cm.
   * @param {number} y Y axis position.
   * @returns {number} Depth of this layer in cm.
   */
  SnowProfile.y2depth = function(y) {
    return (y - SnowProfile.Cfg.HANDLE_MIN_Y) / SnowProfile.Cfg.DEPTH_SCALE;
  };

  /**
   * Convert a snow layer depth value to a drawing Y axis position
   *
   * @method
   * @memberof SnowProfile
   * @param {number} depth Depth from the snow surface in cm.
   * @returns {number} Y position.
   */
  SnowProfile.depth2y = function(depthArg) {
    var y = (depthArg * SnowProfile.Cfg.DEPTH_SCALE) +
      SnowProfile.Cfg.HANDLE_MIN_Y;
    return y;
  };

  /**
   * Get the Y axis value for the line below the description of a layer.
   *
   * @param {number} i Index of the layer.
   * @returns {number} Y axis value of the line below the ith layer.
   */
  SnowProfile.lineBelowY = function(i) {
    return SnowProfile.Cfg.HANDLE_MIN_Y + (SnowProfile.Cfg.HANDLE_SIZE / 2) +
      ((i + 1) * SnowProfile.Cfg.DESCR_HEIGHT);
  };

  /**
   * Tell listeners to hide anything that should not appear on
   * the final image.
   *
   * This event is fired just before the image is generated
   * from the drawing.
   * @event SnowProfileHideControls
   * @memberof SnowProfile
   * @type {string}
   */

  /**
   * Tell listeners to show controls hidden from the image.
   *
   * This event is fired after the image has been generated from
   * the canvas.  It tells listeners they should show anything that was
   * hidden from the image.
   * @event SnowProfileShowControls
   * @memberof SnowProfile
   * @type {string}
   */

  /**
   * Tell listeners the reference grid has changed.
   *
   * This event is fired when the user changes a parameter that
   * governs the reference grid.  It tells listeners to respond to the
   * new grid parameters by adjusting their data display.
   * @event SnowProfileDrawGrid
   * @memberof SnowProfile
   * @type {string}
   * @see SnowProfile.Grid
   */

  /**
   * Tell listeners that a SnowProfile.Button has been clicked
   *
   * @event SnowProfileButtonClick
   * @memberof SnowProfile
   * @type {Object}
   */

  /**
   * Produce a preview PNG in a new window
   *
   * @method
   * @memberof SnowProfile
   * @fires ShowProfileHideControls
   * @fires ShowProfileShowControls
   */
  SnowProfile.preview = function() {

    var saveWidth, saveHeight;

    // Hide the controls so they won't show in the PNG
    $.event.trigger("SnowProfileHideControls");

    // Scale the drawing to desired image size.
    var scaleFactor = SnowProfile.Cfg.IMAGE_WD / SnowProfile.drawing.width();
    saveWidth = SnowProfile.drawing.width();
    saveHeight = SnowProfile.drawing.height();
    SnowProfile.mainGroup.scale(scaleFactor);
    SnowProfile.drawing.size(SnowProfile.Cfg.DRAWING_WD * scaleFactor,
      SnowProfile.drawing.height() * scaleFactor);
    var svg = SnowProfile.diagram.firstChild;
    svg.toDataURL("image/png", {
      callback: function(data) {

        // Open a new window and show the PNG in it
        var newWin = window.open(data, "_blank");
        if (newWin === undefined) {
          alert("You must enable pop-ups for this site to use" +
            " the Preview button");
        }

        // Restore normal drawing scale.
        SnowProfile.drawing.width(saveWidth);
        SnowProfile.drawing.height(saveHeight);
        SnowProfile.mainGroup.scale(1);
        $.event.trigger("SnowProfileShowControls");
      }
    });
  };

  /**
   * Create a new snow layer with associated Features object
   */
  SnowProfile.newLayer = function(depth) {
    var layer = new SnowProfile.Layer(depth);
    var features = new SnowProfile.Features(layer);
    layer.features(features);
    SnowProfile.setIndexPositions();
    SnowProfile.setDrawingHeight();
  };

  /**
   * Initialize the SVG drawing and the grid group
   *
   * @method
   * @memberof SnowProfile
   * @fires SnowProfileHideControls
   * @listens SnowProfileButtonClick
   * @todo Replace references Kinetic
   */
  SnowProfile.init = function() {
    // Add the reference grid to the SVG drawing
    new SnowProfile.Grid();

    // Add an "Insert" button to allow the user to insert a snow layer
    // above the top snow layer.
    var insertButton = new SnowProfile.Button("Insert");
    insertButton.setY(SnowProfile.Cfg.HANDLE_MIN_Y +
      (SnowProfile.Cfg.HANDLE_SIZE / 2));

    // When Insert button clicked, insert a new snow layer at depth zero.
    $(document).bind("SnowProfileButtonClick", function(evt, extra) {
      if (extra.buttonObj === insertButton) {
        SnowProfile.newLayer(0);
        evt.stopImmediatePropagation();
      }
    });

    // When the "Preview" button is clicked, generate a preview
    $(document).ready(function() {
      $("#snow_profile_preview").click(SnowProfile.preview);
    });
  };  // function SnowProfile.init();
})();

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
