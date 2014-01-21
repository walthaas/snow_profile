/**
  @file Defines the namespace and configuration for the snow profile editor.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
  @namespace SnowProfile
 */
var SnowProfile = {};

/**
 * Layout of the snow profile Kinetic stage:
 *
 *       | Top Labels
 * ___________________________________________________________________
 *       |             |          |        |       |
 * Depth |             |          |        |       |
 * Label | Graph       | Controls | Grains | Water | Comment
 *       |             |          |        |       |
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
    DEPTH_LABEL_WD: 70,

    /**
     * Width in pixels available for plotting data.
     * @const
     */
    GRAPH_WIDTH: 350,

    /**
      Width in pixels of the area used by buttons and
      connectors (diagonal lines).
      @const
     */
    CTRLS_WD: 200,

    /**
      Width in pixels of the area used by snow grain description
      @const
     */
    GRAIN_WD: 180,

    /**
      Width in pixels of the area used by snow liquid water description
      @const
     */
    LWC_WD: 70,

    /**
      Width in pixels of the area used by snow layer comment
      @const
     */
    COMMENT_WD: 200,

    /**
     * Vertical height in pixels of the temperature (horizontal) axis label.
     * @const
     */
    TOP_LABEL_HT: 40,

    /**
     * Height in pixels available for plotting data.
     * @const
     */
    GRAPH_HEIGHT: 500,

    /**
      Height in pixels of the text description area for one snow layer
      @const
     */
    DESCR_HEIGHT: 40,

    /**
     * Vertical height in pixels of the hardness (horizontal) axis label.
     * @const
     */
    HARD_LABEL_HT: 40,

    /**
     * Size in pixels of the handle square
     * @const
     */
    HANDLE_SIZE: 11,

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
      Make the handle visible if it has not been touched.
      @type {boolean}
     */
    showHandle: null,

    /**
      Previous state of showHandle.
      @type {boolean}
     */
    oldShowHandle: null,

    /**
      Table of CAAML grain shapes.
      Property name is the code value to store
      Property value is the humanly-readable description
      @type {Object}
      @const
     */
    CAAML_SHAPE: {
      PP: "Precipitation Particles",
      MM: "Machine Made",
      DF: "Decomposing/Fragmented",
      RG: "Rounded Grains",
      FC: "Faceted Crystals",
      DH: "Depth Hoar",
      SH: "Surface Hoar",
      MF: "Melt Forms",
      IF: "Ice Formations"
    },

    /**
      Table of CAAML sub-shapes
      @type {Object}
      @const
     */
    CAAML_SUBSHAPE: {
      PP: {
        PPco: "Prismatic",
        PPnd: "Needles",
        PPpl: "Plates",
        PPsd: "Stellars",
        PPir: "Irregular",
        PPgp: "Graupel",
        PPhl: "Hail",
        PPip: "Ice pellets",
        PPrm: "Rimed"
      },
      MM: {
        MMrp: "Round polycrystalline",
        MMci: "Crushed ice"
      },
      DF: {
        DFdc: "Partly decomposed",
        DFbk: "Wind-broken"
      },
      RG: {
        RGsr: "Small rounded",
        RGlr: "Large rounded",
        RGwp: "Wind packed",
        RGxf: "Faceted rounded"
      },
      FC: {
        FCso: "Solid faceted",
        FCsf: "Near surface",
        FCxr: "Rounded faceted"
      },
      DH: {
        DHcp: "Hollow cups",
        DHpr: "Hollow prisms",
        DHch: "Chains of depth hoar",
        DHla: "Large striated",
        DHxr: "Rounding depth hoar"
      },
      SH: {
        SHsu: "Surface hoar",
        SHcv: "Cavity hoar",
        SHxr: "Rounding surface hoar"
      },
      MF: {
        MFcl: "Clustered rounded",
        MFpc: "Rounded polycrystals",
        MFsl: "Slush",
        MFcr: "Melt-freeze crust"
      },
      IF: {
        IFil: "Ice layer",
        IFic: "Ice column",
        IFbi: "Basal ice",
        IFrc: "Rain crust",
        IFsc: "Sun crust"
      }
    },

    /**
      Table of CAAML grain sizes.
      Property name is the code value to store
      Property value is the humanly-readable description
      @type {Object}
      @const
     */
    CAAML_SIZE: {
      "very fine": "< 0.2 mm",
      "fine": "0.2 - 0.5 mm",
      "medium": "0.5 - 1.0 mm",
      "coarse": "1.0 - 2.0 mm",
      "very coarse": "2.0 - 5.0 mm",
      "extreme": "> 5.0 mm"
    },

    /**
      Table of CAAML liquid water contents.
      Property name is the code value to store
      Property value is the humanly-readable description
      @type {Object}
      @const
     */
    CAAML_LWC: {
      D: "Dry",
      M: "Moist",
      W: "Wet",
      V: "Very Wet",
      S: "Soaked"
    }
  }; // SnowProfile = {

  /**
    Central x of the data plotting area.
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.GRAPH_CENTER_X = SnowProfile.DEPTH_LABEL_WD + 1 +
    (SnowProfile.GRAPH_WIDTH / 2);

  /**
    Central Y of the data plotting area.
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.GRAPH_CENTER_Y = SnowProfile.TOP_LABEL_HT + 1 +
    (SnowProfile.GRAPH_HEIGHT / 2);

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
  SnowProfile.HANDLE_MIN_Y = SnowProfile.TOP_LABEL_HT + 1;

  /**
    Get the Y axis value for the line below the description of a layer.
    @param {number} i Index of the layer.
    @returns {number} Y axis value of the line below the ith layer.
   */
  SnowProfile.lineBelowY = function(i) {
    return SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2) +
      ((i + 1) * SnowProfile.DESCR_HEIGHT);
  };

  /**
    Maximum Y value allowed for any handle (bottom of graph area)
    @const
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.HANDLE_MAX_Y = SnowProfile.TOP_LABEL_HT + 1 +
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
    ['I',     1, SnowProfile.HANDLE_MIN_X + SnowProfile.HARD_BAND_WD * 19.5]
  ];

  /**
    Vertical height in pixels of the KineticJS stage
    @const
    @memberof SnowProfile
   */
   SnowProfile.STAGE_HT =  SnowProfile.TOP_LABEL_HT + 1 +
     SnowProfile.GRAPH_HEIGHT + 1 + SnowProfile.HARD_LABEL_HT;

  /**
    Horizontal width in pixels of the KineticJS stage
    @const
    @memberof SnowProfile
   */
   SnowProfile.STAGE_WD = SnowProfile.DEPTH_LABEL_WD + 1 +
     SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD + 1 +
     SnowProfile.GRAIN_WD + 1 + SnowProfile.LWC_WD + 1 +
     SnowProfile.COMMENT_WD;

  /**
    X position of the center line of the buttons in the control area
   */
  SnowProfile.BUTTON_X =  SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 150;

  /**
    X position of the left edge of the Grains text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.GRAIN_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD;

  /**
    X position of the left edge of the Water text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.LWC_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD +
    SnowProfile.GRAIN_WD;

  /**
    X position of the left edge of the Comment text area
    @const
    @memberof SnowProfile
   */
  SnowProfile.COMMENT_LEFT = SnowProfile.DEPTH_LABEL_WD + 1 +
    SnowProfile.GRAPH_WIDTH + 1 + SnowProfile.CTRLS_WD +
    SnowProfile.GRAIN_WD + SnowProfile.LWC_WD;

  /**
    Depth scale in pixels per cm
    @const
    @memberof SnowProfile
   */
  SnowProfile.DEPTH_SCALE = SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH;

  /**
    Recalculate the Y axis positions of all KineticJS objects whose position
    depends on the index of the layer in the snowpack.
   */
  SnowProfile.setIndexPositions = function() {
    var i,
      numLayers = SnowProfile.snowLayers.length;

    for (i = 0; i < numLayers; i++) {
      SnowProfile.snowLayers[i].setIndexPosition();
    }
  };

  /**
   * Initialize the container and the grid layer
   */
  SnowProfile.init = function() {
    var cm, i, numLayers, x;

    SnowProfile.stage = new Kinetic.Stage({
      container: 'snow_profile_diagram',
      width: SnowProfile.STAGE_WD,
      height: SnowProfile.STAGE_HT
    });

    // Create the KineticJS layer
    SnowProfile.kineticJSLayer = new Kinetic.Layer();

  /**
   * Add a text label for "Depth"
   */
  SnowProfile.kineticJSLayer.add(new Kinetic.Text({
    text: "Depth",
    rotationDeg: 270,
    fontSize: 18,
    fontStyle: 'bold',
    fontFamily: 'sans-serif',
    fill: SnowProfile.LABEL_COLOR,
    x: 10,
    y: SnowProfile.GRAPH_CENTER_Y
  }));

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
    for (cm = 0; cm <= SnowProfile.MAX_DEPTH; cm += 20) {
      SnowProfile.kineticJSLayer.add(new Kinetic.Text({
        x: 40,
        y: SnowProfile.HANDLE_MIN_Y + cm * SnowProfile.DEPTH_SCALE,
        text: cm,
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        fill: SnowProfile.LABEL_COLOR,
        align: 'right'
      }));

      // Draw a horizontal line across the top of the description area
      SnowProfile.kineticJSLayer.add(new Kinetic.Line({
        points: [
          [SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH,
            SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)],
          [SnowProfile.STAGE_WD - 3,
            SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)]
        ],
        stroke: SnowProfile.GRID_COLOR,
        strokeWidth: 1
      }));

      // Add an "Insert" button to allow the user to insert a snow layer
      // above the top snow layer.
      var insertButton = new SnowProfile.Button("Insert");
      insertButton.setY(SnowProfile.HANDLE_MIN_Y +
        (SnowProfile.HANDLE_SIZE / 2));

      // When Insert button clicked, insert a new snow layer at depth zero.
      $(document).bind("SnowProfileButtonClick", function(evt, extra) {
        if (extra.buttonObj === insertButton) {
          new SnowProfile.Layer(0);
          evt.stopImmediatePropagation();
        }
      });

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
    for (i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      x = SnowProfile.DEPTH_LABEL_WD + 1 + (SnowProfile.HARD_BAND_WD * i) +
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
    var hardnessText = new Kinetic.Text({
      x: SnowProfile.GRAPH_CENTER_X,
      y: SnowProfile.STAGE_HT - 16,
      text: 'Hardness',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "center"
    });
    hardnessText.setOffsetX(hardnessText.getWidth() / 2 );
    SnowProfile.kineticJSLayer.add(hardnessText);

    // Add the label to the Grain Type column
    var grainText = new Kinetic.Text({
      x: SnowProfile.GRAIN_LEFT,
      y: 25,
      text: 'Grain Type',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(grainText);

    // Add the label to the Water column
    var waterText = new Kinetic.Text({
      x: SnowProfile.LWC_LEFT,
      y: 25,
      text: 'Water',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(waterText);

    // Add the label to the Comment column
    var commentText = new Kinetic.Text({
      x: SnowProfile.COMMENT_LEFT,
      y: 25,
      text: 'Comment',
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      align: "left"
    });
    SnowProfile.kineticJSLayer.add(commentText);

    // add the KineticJS layer to the stage
    SnowProfile.stage.add(SnowProfile.kineticJSLayer);

    // Create an animation
    // FIXME use a custom event to communicate with layers
    var anim = new Kinetic.Animation(function(frame) {
      SnowProfile.showHandle = (frame.time % 1000) > 500;
      if (SnowProfile.oldShowHandle === null) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;
      }
      else {
        if (SnowProfile.showHandle !== SnowProfile.oldShowHandle) {
          SnowProfile.oldShowHandle = SnowProfile.showHandle;

          // For each snow layer, if handle untouched, blink
          numLayers = SnowProfile.snowLayers.length;
          for (i = 0; i < numLayers; i++) {
            SnowProfile.snowLayers[i].setHandleVisibility(SnowProfile.showHandle);
          }
        }
      }
    });
    anim.start();

    // Populate the grain shape selector in the layer description pop-up
    for (var code in SnowProfile.CAAML_SHAPE) {
      if (SnowProfile.CAAML_SHAPE.hasOwnProperty(code)) {
        $("#snow_profile_grain_shape").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_SHAPE[code] + "</option>");
      }
    }

    // Create the <select>s for the grain subshape from the CAAML_SUBSHAPE
    // table.
    var html = "";
    for (var shape in SnowProfile.CAAML_SUBSHAPE)  {
      html += "<select id=\"snow_profile_grain_subshape_" + shape +
        "\" style=\"display: none\">";
      html += "<option value=\"\" selected=\"selected\"></option>";
      for (var subShape in SnowProfile.CAAML_SUBSHAPE[shape]) {
        html += "<option value=\"" + subShape + "\">" +
          SnowProfile.CAAML_SUBSHAPE[shape][subShape] + "</option>";
      }
      html += "</select>";
    }
    $("#snow_profile_grain_subshape").append(html);

    // Listen for changes to the grain shape
    $("#snow_profile_grain_shape").change(function() {

      // Grain shape selection has changed, so adjust sub-shape <select>.
      $("#snow_profile_grain_subshape select").attr("style", "display:none;");
      $("#snow_profile_grain_subshape option").attr("selected", false);
      if ($("#snow_profile_grain_shape").val()) {

        // A non-null grain shape has been selected.  Display the sub-shape
        $("#snow_profile_grain_subshape_" +
          $("#snow_profile_grain_shape").val()).attr("style", "display:block;");
      }
    });

    // Populate the grain size selector in the layer description pop-up
    for (code in SnowProfile.CAAML_SIZE) {
      if (SnowProfile.CAAML_SIZE.hasOwnProperty(code)) {
        $("#snow_profile_grain_size").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_SIZE[code] + "</option>");
      }
    }

    // Populate the liquid water selector in the layer description pop-up
    for (code in SnowProfile.CAAML_LWC) {
      if (SnowProfile.CAAML_LWC.hasOwnProperty(code)) {
        $("#snow_profile_lwc").append("<option value=\"" + code +
          "\">" + SnowProfile.CAAML_LWC[code] + "</option>");
      }
    }

    // When the "Preview" button is clicked, generate a preview
    $(document).ready(function() {
      $("#snow_profile_preview").click(function() {

        // Hide the controls so they won't show in the PNG
        $.event.trigger("SnowProfileHideControls");

        // Open a new window and show the PNG in it
        var canvas = $('#snow_profile_diagram canvas').toArray()[0];
        window.open(canvas.toDataURL(), 'new_window',
          'width=SnowProfile.STAGE_WD,height=SnowProfile.STAGE_HT');

        // The PNG has been generated so we can show controls again
        $.event.trigger("SnowProfileShowControls");
      });
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
