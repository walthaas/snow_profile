/**
 @file Define the object that describes the reference grid
 @copyright Walt Haas <haas@xmission.com>
 @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPVv2}
 */

/* global SnowProfile */

/**
 Object describing the reference grid
 @constructor
 */
SnowProfile.Grid = function() {
  "use strict";

  var cm, i, x;

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

};

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
