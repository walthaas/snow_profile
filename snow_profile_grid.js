/**
 * @file Define the singleton object that describes the reference grid
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */

/**
 * @summary Singleton object describing the reference grid
 * @desc The reference grid is the collection of vertical and horizontal
 *   lines and associated letters and numbers that indicate the location of
 *   a data point in the snow profile.  The depth of a point is indicated by
 *   depth numbers along the left edge of the grid and their associated
 *   horizontal lines.  The hardness of a point is indicated by a descriptive
 *   letter along the bottom of the grid and its associated vertical line.
 *
 *   The depth scale must be adjusted whenever the user changes the total
 *   snow depth or snow pit depth or selection of reference to snow surface
 *   or ground.  When this happens, the hardness scale does not change but
 *   its location on the chart must be adjusted to the new bottom.  However
 *   no change to the grid is made when the user moves a data point inside
 *   the snow pack or changes the description of that point.
 *
 *   This object is designed to be a singleton, but there is currently no
 *   mechanism in the constructor to enforce that.
 *
 *   Note that, regardless of what the depth scale shows, the depth of a
 *   point in the snowpack is always handled internally as cm from the
 *   snow surface because that's the way that CAAML represents depth.
 * @constructor
 * @todo "Hand Hardness" label doesn't fit in space at bottom
 */
SnowProfile.Grid = function() {
  "use strict";

  /**
   * Draw the depth scale
   *
   * Generate the label and numbers for snow depth along the left edge
   *   of the graph and the horizontal depth lines across the graph.  This
   *   depends on the user setting of pit depth, total snow depth and
   *   reference to ground or snow surface.
   * @see SnowProfile.gridGroup
   */
  function drawDepthScale() {

    var cm,
      x0 = SnowProfile.DEPTH_LABEL_WD + 1,
      x1 = SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH -
              SnowProfile.HANDLE_SIZE / 2,
      y;

    // Add a Depth label on the left side of the diagram
    SnowProfile.gridGroup.add(SnowProfile.drawing.text("Depth (cm)")
    .font({
      family: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      size: 18,
      style: 'bold'
    })
    .transform({
      x: -30,
      y: (SnowProfile.pitDepth * SnowProfile.DEPTH_SCALE) / 2,
      rotation: 270
    }));

    // Referenced to snow surface or ground?
    // Start drawing lines/labels at zero.  Continue to depth of pit.
    // Horizontal lines are drawn at multiples of DEPTH_LINE_INT regardless of
    //   location of the top or bottom of the scale.
    if (SnowProfile.depthRef === "s") {

      // Depth indication is referenced to snow surface.  Zero is at the top.
      // Numbers and horizontal reference lines are generated from the
      // snow surface down every HORIZ_INT cm to the bottom of the pit.
      for (cm = 0; cm <= SnowProfile.pitDepth;
        cm += SnowProfile.DEPTH_LINE_INT) {
        y = SnowProfile.TOP_LABEL_HT +
          (SnowProfile.HANDLE_SIZE / 2) + (cm * SnowProfile.DEPTH_SCALE);
        SnowProfile.gridGroup.add(SnowProfile.drawing.text(String(cm))
        .font({
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR})
        .transform({
          x: 40,
          y: y - 8,
        }));

        // Draw a horizontal line every DEPTH_LINE_INT cm as a depth scale
        if (cm !== SnowProfile.pitDepth) {
          SnowProfile.gridGroup.add(SnowProfile.drawing.line(x0, y, x1, y)
            .stroke({
              color: SnowProfile.GRID_COLOR,
              width: 1
          }));
        }
      }
    }
    else {

      // Depth indication is referenced to ground.  Zero is the ground.
      // The bottom of the grid is shown as (totalDepth - pitDepth).  The
      // lowest grid line is at the next integer multiple of DEPTH_LINE_INT cm.
      var bottom = SnowProfile.totalDepth - SnowProfile.pitDepth;
      var lowestLine = Math.ceil(bottom / SnowProfile.DEPTH_LINE_INT) *
        SnowProfile.DEPTH_LINE_INT;
      for (cm = lowestLine; cm <= SnowProfile.totalDepth;
        cm += SnowProfile.DEPTH_LINE_INT) {
        y = SnowProfile.TOP_LABEL_HT + (SnowProfile.HANDLE_SIZE / 2) +
          ((SnowProfile.totalDepth - cm) * SnowProfile.DEPTH_SCALE);
        SnowProfile.gridGroup.add(SnowProfile.drawing.text(String(cm)).font({
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR}).transform({
          x: 40,
          y: y - 8
        }));

        // Draw a horizontal line every DEPTH_LINE_INT cm as a depth scale
        if (cm !== SnowProfile.totalDepth) {
          SnowProfile.gridGroup.add(SnowProfile.drawing.line(x0, y, x1, y)
            .stroke({
              color: SnowProfile.GRID_COLOR,
              width: 1
          }));
        }
      }
    }
  } // function drawDepthScale()

  /**
   * Draw the hardness scale
   *
   * Draw the vertical lines indicating snow hardness
   * @see SnowProfile.gridGroup
   */
  function drawHardnessScale() {

    var i, x;

    // Add a vertical line along the left edge
    SnowProfile.gridGroup.add(SnowProfile.drawing.line(
      SnowProfile.DEPTH_LABEL_WD,
      SnowProfile.HANDLE_MIN_Y - 1 + (SnowProfile.HANDLE_SIZE / 2),
      SnowProfile.DEPTH_LABEL_WD,
      SnowProfile.depth2y(SnowProfile.pitDepth) + (SnowProfile.HANDLE_SIZE / 2))
      .stroke({
        color: SnowProfile.LABEL_COLOR,
        width: 1
      }));

    // Draw and label the hardness (horizontal) axis
    SnowProfile.gridGroup.add(SnowProfile.drawing.line(
      SnowProfile.DEPTH_LABEL_WD,
      SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2),
      SnowProfile.DEPTH_LABEL_WD + SnowProfile.GRAPH_WIDTH + 1
        - SnowProfile.HANDLE_SIZE / 2,
      SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2)
    )
    .stroke({
      color: SnowProfile.LABEL_COLOR,
      width: 1
    }));

    // Iterate through the table of CAAML hardness codes to
    // build the hardness (horizontal) scale for the graph area
    for (i = 0; i < SnowProfile.CAAML_HARD.length; i++) {
      x = SnowProfile.DEPTH_LABEL_WD + 1 + (SnowProfile.HARD_BAND_WD * i) +
        (SnowProfile.HANDLE_SIZE / 2);
      if (SnowProfile.CAAML_HARD[i][1]) {

        // Add a vertical line to show SnowProfile hardness value
        SnowProfile.gridGroup.add(SnowProfile.drawing.line(
          x, SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2),
          x, SnowProfile.handleMaxY + (SnowProfile.HANDLE_SIZE / 2))
          .stroke({
          color: SnowProfile.GRID_COLOR,
          width: 1
        }));
        SnowProfile.gridGroup.add(SnowProfile.drawing.text(
          SnowProfile.CAAML_HARD[i][0])
        .font({
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR
        })
        .transform({
          x: x - 1,
          y: SnowProfile.depth2y(SnowProfile.pitDepth) +
            (SnowProfile.HANDLE_SIZE / 2) + 3,
        }));
      }
    }

    // Add 'Hand Hardness' label at bottom
    SnowProfile.gridGroup.add(SnowProfile.drawing.text( 'Hand Hardness')
    .font({
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR})
    .transform({
      x: SnowProfile.GRAPH_WIDTH / 2,
      y: SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2) + 19
    }));
  } // function drawHardnessScale()

  /**
   * Draw the labels for the observation columns
   * @see SnowProfile.gridGroup
   * @todo Column headings don't fit
   */
  function drawLabels() {

    // Draw a horizontal line across the top of graph and description areas
    SnowProfile.gridGroup.add(SnowProfile.drawing.line(
      SnowProfile.DEPTH_LABEL_WD + 1,
      SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2),
      SnowProfile.DRAWING_WD - 3,
      SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2))
    .stroke({
      color: SnowProfile.GRID_COLOR,
      width: 1
    }));

    // Add the label to the Grain Type column
    SnowProfile.gridGroup.add(SnowProfile.drawing.text('Grain\nForm    Size')
    .font({
      fontSize: 14,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR})
    .transform({
      x: SnowProfile.GRAIN_LEFT,
      y: 12
    }));

    // // Add the label to the Water column
    // var waterText = new Kinetic.Text({
    //   x: SnowProfile.LWC_LEFT,
    //   y: 25,
    //   text: 'Water',
    //   fontSize: 18,
    //   fontStyle: 'bold',
    //   fontFamily: 'sans-serif',
    //   fill: SnowProfile.LABEL_COLOR,
    //   align: "left"
    // });
    // SnowProfile.gridGroup.add(waterText);

    // Add the label to the Comment column
    SnowProfile.gridGroup.add(SnowProfile.drawing.text('Comment')
    .font({
      fontSize: 14,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR})
    .transform({
      x: SnowProfile.COMMENT_LEFT,
      y: 25
    }));
  } // function drawLabels()

  /**
   * Draw the reference grid
   *
   * Throw away existing grid if any, then set the drawing size and draw
   * the reference grid.
   * @see SnowProfile.gridGroup
   * @fires SnowProfileDrawGrid
   */
  function drawGrid() {

    // Throw away the existing grid
    SnowProfile.gridGroup.clear();

    // Set size of drawing
    SnowProfile.drawing.size(SnowProfile.DRAWING_WD,
      SnowProfile.drawingHeight());

    // Adjust height of background to match
    //backGround.height(SnowProfile.stageHeight());

    // Set the maximum Y value to which a handle may be dragged
    SnowProfile.handleMaxY = SnowProfile.TOP_LABEL_HT + 1 +
      (SnowProfile.DEPTH_SCALE * SnowProfile.pitDepth);

    // Draw the depth scale
    drawDepthScale();

    // Draw the hardness scale
    drawHardnessScale();

    // Draw labels
    drawLabels();

    // Trigger a custom event to let the rest of the code know
    $.event.trigger("SnowProfileDrawGrid");
  } // function drawGrid()

  /**
   * Respond to change in total snow depth value.
   */
  function totalDepthChange() {
    var totalDepth = $("#snow_profile_total_depth").val();
    if (totalDepth === '') {
      SnowProfile.totalDepth = null;

      // We don't know the total snow depth so we must
      // reference depth from the snow surface.
      $("#snow_profile_ref_depth").attr("style", "display: none;");
      SnowProfile.depthRef = "s";
      $("#snow_profile_ref_select option").attr("selected", false);
      $("#snow_profile_ref_select option[value='s']").attr("selected", true);
      drawGrid();
      return;
    }
    if ((totalDepth.search(/^\d+$/) < 0) ||
      (totalDepth < SnowProfile.MIN_DEPTH)) {
      alert("Total snow depth must be a number >= " +
        SnowProfile.MIN_DEPTH);
      $("#snow_profile_total_depth").val(SnowProfile.totalDepth);
      return;
    }

    // If this is the first time total snow depth is provided,
    // then set the depth reference to "ground"
    if (SnowProfile.totalDepth === null) {
      SnowProfile.depthRef = "g";
      $("#snow_profile_ref_select option").attr("selected", false);
      $("#snow_profile_ref_select option[value='g']").attr("selected", true);
    }
    SnowProfile.totalDepth = Number(totalDepth);

    // We know the total snow depth so can offer to measure
    // depth from the ground.
    $("#snow_profile_ref_depth").attr("style", "display:inline");

    // Don't allow the pit depth to be greater than total snow depth
    if (SnowProfile.pitDepth > totalDepth) {
      $("#snow_profile_pit_depth").val(totalDepth);
      SnowProfile.pitDepth = Number(totalDepth);
    }

    // Draw the grid with the new total snow depth
    drawGrid();
  } // function totalDepthChange()

  /**
   * @summary Respond to a change in the depth of the pit
   * @desc Input the value set by the user in the "Snow pit depth" box.
   *   Check that it is a number in the range MIN_DEPTH .. MAX_DEPTH not
   *   greater than total snow depth.  If checks pass, save this pit depth.
   *   If the checks fail, put the previous value back in the input box.
   */
  function pitDepthChange() {

    var pitDepth = $("#snow_profile_pit_depth").val();
    var totalDepth = SnowProfile.totalDepth;
    if ((pitDepth.search(/^\d+$/) < 0) ||
      (pitDepth < SnowProfile.MIN_DEPTH)) {
      alert("Snow pit depth must be a number >= " +
        SnowProfile.MIN_DEPTH);
      $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
      return;
    }
    if (pitDepth > SnowProfile.MAX_DEPTH) {
      alert("Snow pit depth must be less than or equal to " +
        SnowProfile.MAX_DEPTH + " cm");
      $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
      return;
    }
    if (totalDepth && (pitDepth > totalDepth)) {
      alert("Snow pit depth cannot be greater than total snow depth");
      $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
      return;
    }
    SnowProfile.pitDepth = Number(pitDepth);
    drawGrid();
  } // function pitDepthChange()

  // Set controls to default values
  $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
  $("#snow_profile_total_depth").val(SnowProfile.totalDepth);
  $("#snow_profile_ref_depth").val(SnowProfile.depthRef);

  // var backGround = new Kinetic.Rect({
  //   x: 0,
  //   y: 0,
  //   width: SnowProfile.stage.width(),
  //   height: 10,
  //   fill: SnowProfile.BACKGROUND_COLOR,
  //   opacity: 1
  // });
  // SnowProfile.gridGroup.add(backGround);

  // Listen for a change to the "Total snow depth" input
  $("#snow_profile_total_depth").change(totalDepthChange);

  // Listen for a change to the "snow pit depth" input
  $("#snow_profile_pit_depth").change(pitDepthChange);

  // Listen for a change to the "Measure depth from" select
  $("#snow_profile_ref_select").change(function() {
    SnowProfile.depthRef = $("#snow_profile_ref_select").val();
    drawGrid();
  });

  drawGrid();
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
