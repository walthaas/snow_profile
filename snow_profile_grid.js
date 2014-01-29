/**
 @file Define the object that describes the reference grid
 @copyright Walt Haas <haas@xmission.com>
 @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
 * @summary Object describing the reference grid
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
 *   the snow pack or changes the description of that point.  For this reason
 *   the grid is handled as its own KineticJS layer.
 *
 *   This object is designed to be a singleton, but there is currently no
 *   mechanism in the constructor to enforce that.
 *
 *   Note that, regardless of what the depth scale shows, the depth of a
 *   point in the snowpack is always handled internally as cm from the
 *   snow surface (because that's the way that CAAML represents depth).
 * @constructor
 */
SnowProfile.Grid = function() {
  "use strict";

  var i, x;

  // Set controls to default values
  $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
  $("#snow_profile_total_depth").val(SnowProfile.totalDepth);
  $("#snow_profile_ref_depth").val(SnowProfile.depthRef);

  /**
   * KineticJS layer to hold the reference grid
   * @type {Object}
   */
  var gridLayer = new Kinetic.Layer();

  /**
   * @summary Create the depth scale group
   * @desc Generate the label and numbers for snow depth along the left edge
   *   of the graph and the horizontal depth lines across the graph.  This
   *   must all be adjusted whenever the user changes pit depth or total snow
   *   depth or sets the reference to ground or snow surface.  The approach
   *   we use is to destroy the label and numbers and horizontal lines, then
   *   re-create them all with the new parameters.  This method does the
   *   re-creation part of the job.  The destroy part is done elsewhere.
   * @returns {Object} Kinetic.Group object with the adjusted depth scale.
   */
  function depthScaleGrp() {
    var group = new Kinetic.Group({
      x: 0,
      y: SnowProfile.TOP_LABEL_HT
    });
    var cm;

    /**
     * Add a text label for "Depth"
     * @type {Object}
     */
    var depthText = new Kinetic.Text({
      text: "Depth",
      rotationDeg: 270,
      fontSize: 18,
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      fill: SnowProfile.LABEL_COLOR,
      x: 10,
      y: (SnowProfile.pitDepth * SnowProfile.DEPTH_SCALE) / 2
    });
    depthText.setOffsetX(depthText.getWidth() / 2 );
    group.add(depthText);

    // Referenced to snow surface or ground?
    // Start drawing lines/labels at zero.  Continue to depth of pit.
    // Horizontal lines are drawn at multiples of 20 cm regardless of
    //   location of the top or bottom of the scale.
    if (SnowProfile.depthRef === "s") {

      // Depth indication is referenced to snow surface.  Zero is at the top.
      // Numbers and horizontal reference lines are generated from the
      // snow surface down every 20 cm to the bottom of the pit.
      for (cm = 0; cm <= SnowProfile.pitDepth; cm += 20) {
        group.add(new Kinetic.Text({
          x: 40,
          y: cm * SnowProfile.DEPTH_SCALE,
          text: cm,
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR,
          align: 'right'
        }));

        // Draw a horizontal line every 20 cm as a depth scale
        if (cm !== SnowProfile.pitDepth) {
          group.add(new Kinetic.Line({
            points: [SnowProfile.DEPTH_LABEL_WD + 1,
                (SnowProfile.HANDLE_SIZE / 2) +
                  (cm * SnowProfile.DEPTH_SCALE),
                SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH -
                  SnowProfile.HANDLE_SIZE / 2,
                (SnowProfile.HANDLE_SIZE / 2) +
                   (cm * SnowProfile.DEPTH_SCALE)],
            stroke: SnowProfile.GRID_COLOR,
            strokeWidth: 1
          }));
        }
      }
    }
    else {

      // Depth indication is referenced to ground.  Zero is the ground.
      // The bottom of the grid is shown as (totalDepth - pitDepth).  The
      // lowest grid line is at the next integer multiple of 20 cm.
      var bottom = SnowProfile.totalDepth - SnowProfile.pitDepth;
      var lowestLine = Math.ceil(bottom / 20) * 20;
      for (cm = lowestLine; cm <= SnowProfile.totalDepth; cm += 20) {
        group.add(new Kinetic.Text({
          x: 40,
          y: (SnowProfile.totalDepth - cm) * SnowProfile.DEPTH_SCALE,
          text: cm,
          fontSize: 12,
          fontStyle: 'bold',
          fontFamily: 'sans-serif',
          fill: SnowProfile.LABEL_COLOR,
          align: 'right'
        }));

        // Draw a horizontal line every 20 cm as a depth scale
        if (cm !== SnowProfile.totalDepth) {
          group.add(new Kinetic.Line({
            points: [SnowProfile.DEPTH_LABEL_WD + 1,
              (SnowProfile.HANDLE_SIZE / 2) +
                ((SnowProfile.totalDepth - cm) * SnowProfile.DEPTH_SCALE),
              SnowProfile.DEPTH_LABEL_WD + 1 + SnowProfile.GRAPH_WIDTH -
                SnowProfile.HANDLE_SIZE / 2,
              (SnowProfile.HANDLE_SIZE / 2) +
                ((SnowProfile.totalDepth - cm) * SnowProfile.DEPTH_SCALE)],
            stroke: SnowProfile.GRID_COLOR,
            strokeWidth: 1
          }));
        }
      }
    }
    return group;
  }

  /**
   * @summary Depth scale
   * @desc Holds the depth label and horizontal reference lines.  These
   *   are all held in one group so that when it is time to adjust the
   *   snow pit depth we can destroy the group and create it again with
   *   the new values.
   * @type {Object}
   */
  var depthScale = depthScaleGrp();
  gridLayer.add(depthScale);

  /**
   * @summary Vertical lines of the grid.
   * @desc The first vertical line is the left edge of the graph, and
   *   the remaining lines are references for hardness values.  We need
   *   to adjust the bottom Y of each line when the snow pit depth changes
   *   so we keep the KineticJS Line objects in an array for convenience.
   * @type {Object[]}
   */
  var verticalLines = [];

  /**
   * Add a vertical line along the left edge
   * @type {Object}
   */
  verticalLines.push(new Kinetic.Line({
    points: [SnowProfile.DEPTH_LABEL_WD,
      SnowProfile.HANDLE_MIN_Y - 1 +
       (SnowProfile.HANDLE_SIZE / 2),
      SnowProfile.DEPTH_LABEL_WD,
      SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2)],
    stroke: SnowProfile.LABEL_COLOR,
    strokeWidth: 1
  }));

  /**
   * @summary Group to hold the hardness scale at bottom of grid
   * @desc KineticJS group to hold all the elements of the hardness
   *   scale.  We do this so we can reposition the group as a single
   *   unit when it must be adjusted to a new snow pit depth.
   */
  var hardScaleGrp = new Kinetic.Group({
    x: SnowProfile.DEPTH_LABEL_WD,
    y: SnowProfile.depth2y(SnowProfile.pitDepth) +
      (SnowProfile.HANDLE_SIZE / 2)
  });

  // Draw and label the hardness (horizontal) axis
  hardScaleGrp.add(new Kinetic.Line({
    points: [0, 0,
      SnowProfile.GRAPH_WIDTH +1 - SnowProfile.HANDLE_SIZE / 2, 0],
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
      verticalLines.push(new Kinetic.Line({
        points: [x, SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2),
          x, SnowProfile.handleMaxY + (SnowProfile.HANDLE_SIZE / 2)],
        stroke: SnowProfile.GRID_COLOR,
        strokeWidth: 1
      }));
      hardScaleGrp.add(new Kinetic.Text({
        x: x - SnowProfile.DEPTH_LABEL_WD -1,
        y: 3,
        text: SnowProfile.CAAML_HARD[i][0],
        fontSize: 12,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
        fill: SnowProfile.LABEL_COLOR,
        align: 'center'
      }));
    }
  }

  // Add all vertical lines to gridLayer
  verticalLines.forEach(function(line) {
    gridLayer.add(line);
  });

  var hardnessText = new Kinetic.Text({
    x: SnowProfile.GRAPH_WIDTH / 2,
    y: 16,
    text: 'Hardness',
    fontSize: 18,
    fontStyle: 'bold',
    fontFamily: 'sans-serif',
    fill: SnowProfile.LABEL_COLOR,
    align: "center"
  });
  hardnessText.setOffsetX(hardnessText.getWidth() / 2 );
  hardScaleGrp.add(hardnessText);
  gridLayer.add(hardScaleGrp);


  /**
   * @summary Respond to change in total snow depth value.
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
      adjustGrid();
      return;
    }
    if (( totalDepth.search(/^\d+$/) < 0) ||
      (totalDepth < SnowProfile.MIN_SETTABLE_DEPTH)) {
      alert("Total snow depth must be a number >= " +
        SnowProfile.MIN_SETTABLE_DEPTH);
      $("#snow_profile_total_depth").val(SnowProfile.totalDepth);
      return;
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

    // Adjust the grid for the new total snow depth
    adjustGrid();
  }

  /**
   * @summary Respond to a change in the depth of the pit
   */
  function pitDepthChange() {
    var pitDepth = $("#snow_profile_pit_depth").val();
    if ((pitDepth.search(/^\d+$/) < 0) ||
      (pitDepth < SnowProfile.MIN_SETTABLE_DEPTH)) {
      alert("Snow pit depth must be a number >= " +
        SnowProfile.MIN_SETTABLE_DEPTH);
      $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
      return;
    }
    var totalDepth = SnowProfile.totalDepth;
    if (totalDepth && (pitDepth > totalDepth)) {
      alert("Snow pit depth cannot be greater than total snow depth");
      $("#snow_profile_pit_depth").val(SnowProfile.pitDepth);
      return;
    }
    SnowProfile.pitDepth = Number(pitDepth);
    adjustGrid();
  }

  /**
   * @summary Adjust grid for change in depth or reference
   */
  function adjustGrid() {

    // Adust lengths of vertical lines
    var points;
    verticalLines.forEach(function(line){
      points = line.getPoints();
      points[1].y = SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2);
      line.setPoints(points);
    });

    // Adjust position of hardness scale group
    hardScaleGrp.setPosition({
      x: SnowProfile.DEPTH_LABEL_WD,
      y: SnowProfile.depth2y(SnowProfile.pitDepth) +
        (SnowProfile.HANDLE_SIZE / 2)
    });

    // Destroy and re-create the depth scale
    depthScale.destroy();
    depthScale = depthScaleGrp();
    gridLayer.add(depthScale);

    // Set the maximum Y value to which a handle may be dragged
    SnowProfile.handleMaxY = SnowProfile.TOP_LABEL_HT + 1 +
      (SnowProfile.DEPTH_SCALE * SnowProfile.pitDepth);

    // Trigger a custom event to let the rest of the code know
    $.event.trigger("SnowProfileAdjustGrid");
  }

  // Listen for a change to the "Total snow depth" input
  $("#snow_profile_total_depth").change(totalDepthChange);

  // Listen for a change to the "snow pit depth" input
  $("#snow_profile_pit_depth").change(pitDepthChange);

  // Listen for a change to the "Measure depth from" select
  $("#snow_profile_ref_select").change(function() {
    SnowProfile.depthRef = $("#snow_profile_ref_select").val();
    adjustGrid();
  });

  return gridLayer;
};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
