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
      Height in pixels of the text description area for one snow layer
     * @memberof SnowProfile
      @const {number}
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
     * Depth increment in cm to allow when inserting a layer above
     * or below another layer.
     * @memberof SnowProfile
     * @const {number}
     */
    INS_INCR: 5,

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
  SnowProfile.Cfg.LAYER_DESCR_LEFT = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
    SnowProfile.Cfg.GRAPH_WIDTH + 1 + SnowProfile.Cfg.CTRLS_WD;

  SnowProfile.Cfg.LAYER_DESCR_WD = SnowProfile.Cfg.GRAIN_SHAPE_WD +
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
   * Table of CAAML grain shapes.
   *
   * + Property name is the code value to store.
   * + Property value is the description.
   * @memberof SnowProfile
   * @const {Object}
   */
  SnowProfile.CAAML_SHAPE = {
    PP: {
      text: "Precipitation Particles",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABPSURBVCiRY/j//z8DOm" +
          "ZgYEhgYGD4z8DAkIFNnomBDDDINbEwMjJmYBG3hNK2jIyMGJKMDJBQIgk" +
          "wMjAw4LIpjoGBYRkDA8NhDNnReIIAAEJwQ7TYUolnAAAAAElFTkSuQmCC",
        height: 13,
        width: 13
      }
    },
    MM: {
      text: "Machine Made",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAAN/wAADf8B9IqyiQAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADcSURBVBiVbdGhSsNRGI" +
          "bx37yBsTBYGsgYMqfBbFrxBhZN3oOgyeSQgU0Ek8kgGr0ILTIsWozCYFj" +
          "GwKbH4LvxDx444cDzfrzfc5RSlFKggTGeMMcjzlBfMQEHmAa6wynuscAH" +
          "dsNpYpaJbfQwRBfreE6gDpeZ0MYIPyj4xjE6+EolE9xiO9A1+rhJoIuH7" +
          "GCBExwE7qRfP+8hzjFfwzs28eLvHNVqtR4OA79iA29wVel8EWB5R5XOY2" +
          "jhs2JjB/vYqtiYorH0vJfAf55nGKw+JYFWKk0CTaK1uWR+Aai+ZHz0ufc" +
          "/AAAAAElFTkSuQmCC",
        height: 13,
        width: 13
      }
    },
    DF: {
      text: "Decomposing/Fragmented",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAAV6wAAFesBBGcFMAAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADxSURBVDiNpdKrSkRRFA" +
          "bgzwsKIngBMRgmGAwWo+bp+gD6AOIDCD6AYJ9gFqwG44g2g8lgESyCQbB" +
          "PGBh0WfaRrc7tnBN2Wj/fgrV/EaHOww7usFwXaqKDwE0daA/dBL1jsyp0" +
          "gF6CXrEeEapAR/hK0DPWfmYloZOEBB6x8mteAjrLoHss/MuMgUziPIPam" +
          "OubHQFN4zKDrjAzMD8EmsV1Bl1gaujyAdB8anUBtTAx8iR9oCU8ZNDp2J" +
          "/0B1rFUwYdl6pOBjXwkpBPHJYudII28JagHvbLQsmxhY8EdbFbBSqwdoI" +
          "6aFaFCmwRt9iuA0WEb9vULhTE9LrXAAAAAElFTkSuQmCC",
        height: 18,
        width: 19
      }
    },
    RG: {
      text: "Rounded Grains",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAATEQAAExEBOWB/8AAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACASURBVCiRldLRCcJAEE" +
          "XRk00LQsCqtIOsJQYVDPphAeki2Mb6swkRMWYH3t+9zMA8KSVTENHhldO" +
          "h/WAy2OCG9CNX7JZCvwLPUmbFDfCUNuBg+xxhLNgwBtQFG+qAoUAYAi4F" +
          "whkCnv7ff0c1/WGPxwrco5kfl6UKJ9/ViMtqvAGD/nbwFTl/UgAAAABJR" +
          "U5ErkJggg==",
        height: 12,
        width: 12
      }
    },
    FC: {
      text: "Faceted Crystals",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABPSURBVCiR7dExCoBAEE" +
          "PRt2IlXsPK+9/BUrDyImI3Fq61O42VgSFNPhNIQUiqr35ib8hPGNRPa0R" +
          "4OyyILlsNfuhzqLjHPbA15GeMD5TSBUq1JZC/MAMeAAAAAElFTkSuQmCC",
        height: 13,
        width: 13
      }
    },
    DH: {
      text: "Depth Hoar",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD1SURBVDiNndMvS0NRGA" +
          "fgZ0GYCoaloRhMi6sGP8NA2wxm4/JAEJtFWF9RMBmXF8XgJ1icmFemIoL" +
          "O8hPm2P9wuLzv+zvPgXvuNRqNzFu4WZhZANQxQn0tBEX0g/RRXAdpBvhb" +
          "zZUQlDHED87zHKK8CtLO6bep71K3l0JQxTfesJveHt7Try6DdHPqxUT/M" +
          "v3uXAS1BF+wOTHbwmvmtakINtBL6HTGuzrLvIeNaUgjgScUZiAFPCfX+I" +
          "eghEGu8nDBV3wUZIDSONLK4H7Rf5L8Q/Kt1Cr4wgf2l0QO8Jl9FehEvVo" +
          "GGIOus68DJ3jE9orITi7h+BfPSUFU8uzJMwAAAABJRU5ErkJggg==",
        height: 16,
        width: 17
      }
    },
    SH: {
      text: "Surface Hoar",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEDSURBVDiNldIxTkJBFI" +
          "Xhj4qgiSUJGgsXQENlYa0LoKOwdgVUmBg7K2sqoomVS6Aimli4BhrjBkj" +
          "UWBjG5j6C8B6MxS3mnHP/ezMzcIYn7KaU5Bb28IxTGCPh+p+Qm+gbQxs/" +
          "+MJhJuAI39HXLsRhUB8yIY+RH6aUFGITM8xxvAVwEoAZmgtImP0wX1CrA" +
          "NTwGrn+Ql8K1DGNQK8Cch7+FPU1SIS6EXpDY8XbwXv43T9eybRJBC9X9K" +
          "vQJ2s9JZBOXPAH9kM7wGfona2QaBrF1Ls438d5VJqvgLRikzkuljZrZUM" +
          "CNIjpRQ0qsxsgjXil0tfKggSot+nf5EJquK36wUX9Amy9O8ZyCXfaAAAA" +
          "AElFTkSuQmCC",
        height: 16,
        width: 17
      }
    },
    MF: {
      text: "Melt Forms",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAATOQAAEzkBj8JWAQAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEESURBVCiRndMtS4RBFA" +
          "Xg532DzSDoyiaTitEPxGLS4oLFtn9C8B+Y/RfmBUEMIiIGixi0KWgyycq" +
          "Cot1rmVlGcJfVC5fh3jnnzJmvKiKUUVVVC1tYxQLucY2TiLj4AY4ISaCB" +
          "DmJIHmKiz0nEJroJ8IpdLGMcK9hDL80/Z4FMPk4TZ5jMymViGpfZQd7uT" +
          "mp0BxELgSbeEn6jTocD+xHRMyQi4gUHqdyusZSKq2HEIjJuDT7xhbFhlg" +
          "vrU8n2R40nVJgbceX5ND7UuEvF+ojkjLuBtv+ddis3z/3tnjvlI5nBu9F" +
          "eWBeNPrkQyA4G5TGamVP98qva2MQiZvGIW5xGxFGJ/QaoLuxwkopfZwAA" +
          "AABJRU5ErkJggg==",
        height: 15,
        width: 15
      }
    },
    IF: {
      text: "Ice Formations",
      icon: {
        image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAICAYAAAAiJnXPAAAABHNC" +
          "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
          "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAYSURBVBiVY2RgYPjPQC" +
          "JgIlXDqCZKNQEAsVMBD3cM+XcAAAAASUVORK5CYII=",
        height: 8,
        width: 13
      }
    }
  };

  /**
   * Table of CAAML sub-shapes
   * @type {Object}
   * @memberof SnowProfile
   * @const
   */
  SnowProfile.CAAML_SUBSHAPE = {
    PP: {
      PPco: {
        text: "Columns",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAICAYAAAAiJnXPAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABMSURBVBiVvdCx" +
            "DYAwEAPAe5SeGWiYgbGZIqJkFwZ4mlCTUGDJcmPLlgNpEKXphdrh3zB" +
            "rTWdmeiMO5DQ6Df4LPUcsEbF3+FcIHy6/AcG3I4RzaDQCAAAAAElFTk" +
            "SuQmCC",
          height: 8,
          width: 13
        }
      },
      PPnd: {
        text: "Needles",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABUAAAAKCAYAAABblxXYAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASxAAAEsQBIGmitQAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAC1SURBVCiRndK7" +
            "CgJBDIXhD/Wt9CVWsLBXsNBiwXI7X0N8SCvxsmMTcRxvq4HAkJz8cCa" +
            "RUpIn5tiiV/YKXS9086deIVyhxQWjL9BR6FqsXkKxRsIJ00/AbGYa+o" +
            "T1AxRNNI4YdwFm4HHMJTRRs4lCCiuHP7LNGJsB9u5xg/4aA/Tjvb9Zq" +
            "DP71Y/2q8x+XS5qmS1q0hE4yRa1fHdSi/iCM4ZfgMPQtVi8vdMQz7DT" +
            "7fh3mJW9K/CPft+d08h8AAAAAElFTkSuQmCC",
          height: 10,
          width: 21
        }
      },
      PPpl: {
        text: "Plates",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAOCAYAAAAmL5yKAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASjwAAEo8BVnvO1AAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADZSURBVCiRrdM7" +
            "TkJREAbgTwtWQIOFjQkFJdF9sBY6W/dAR2KMUUpDRe9jFSwCiSYWBC/" +
            "NEM+dXB4xTDLFzPzzz5nHUVWVrWKA6oAOajlFcgvzAC3xmXQZsTlaTQ" +
            "TDALyWFdIL3wMzrBGgjQV+0d9DcB2YBdolwSiYH3clFyT3gR2FrYcVf" +
            "nBZALuY4gVXhb+Dr8jpwSwY71Klp2LykxS7Df/s3J+sHS9npbFt4Rud" +
            "1MIEz6mFi1oLaYjjI4b4UBtiWuP6wBpvGteYDultD8GHpkM6ySn/9zN" +
            "tADskYCazQ11mAAAAAElFTkSuQmCC",
          height: 14,
          width: 16
        }
      },
      PPsd: {
        text: "Stellars",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAOCAYAAAD0f5bSAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASnAAAEpwBstb/cwAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADqSURBVCiRndK/" +
            "SkNRDAbwXy53KZ2kQ9eugg8ggk66ufkIDi4KLhZHn0EnfQc3n0IUdbX" +
            "gJvgHXLSrcfAIl9srlB4IgeQ7Sb4vkZnahkMkTrrylQVeFRG9iBjMA4" +
            "6IQUT0KowxiYiDiKj/AdcRsY8JxhVGWMIpHiJiq/VhE/c4K7jRH/F13" +
            "Poln3gu/q0Ru8NGZmoqVmEXLw1g4h17qLrUS3x3UJqNly6ruG5U/2j5" +
            "xA3WCt55qZR4wo7GcrGNx0bHi6rM/IVjLGfmZWuSK6zgCJ9FHH0M5zk" +
            "jDNGvM3OKaYcAs4pkvmKx2/sBVe+NaMYatvwAAAAASUVORK5CYII=",
          height: 14,
          width: 13
        }
      },
      PPir: {
        text: "Irregular Crystals",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABMAAAAPCAYAAAAGRPQsAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAAS6QAAEukBu3HusgAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEaSURBVDiNpdK/" +
            "K8VRGAbwz7kYkB8lE6PFbqAYlRWTf8FgxeJPEIO/wKDuIIOyUlI2Awa" +
            "LRUkpuRYKr8Ghr9u931vuW2+n03nO8z7neU6KCGWVUhrBImYwjWec4B" +
            "jViPj4BUdE08YUHhC53/BZ2B+i5xdfQrSE13xpD3PoxhAWcJHPzjHcl" +
            "AyzWcE7VppgBnCaCc/Q0Qg0iPsMWm5hQy9uMna1EWAzHx4jlZFl/ET2" +
            "cisV00wpjeEaXajiti7cq4jYbZD4aETc1U/ZLyTVqA/KVHYW2Ccxjxp" +
            "W66fnqlf6twqqjvL0jVY+NfWvYGLgEX3/Jatkget53YyIl9KntKhx3x" +
            "/0Cf3/VfWjbA0JOxFRa0dVBZe4wnY7RPAF/8KM8xJmJpAAAAAASUVOR" +
            "K5CYII=",
          height: 15,
          width: 19
        }
      },
      PPgp: {
        text: "Graupel",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAATCAYAAAB2pebxAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASFwAAEhcBHtZa6AAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFSSURBVDiNndOx" +
            "S1xBEMfxzzuJhICXVhQsAioETBs0CJJasPEPECIWKQNa5Q9IDknlH6C" +
            "FhbUaESSdhRBSHKlsAhIQOauQBCKStXAOnpv39MzCsMzsb76zO8NKKS" +
            "kbnuIAL7L4S+xj/J+cCsg8Er6gEbE+tCM+eyckkj5FwlL4r8P/WKmvg" +
            "UzgEh08wTkuqp5SCwnQWlTvxL5apy1SSoqieIaWm6uJyZJ/iJ+ZZiWl" +
            "1O5WnYlq97WZ8k0eYSSrMod3Jf8N9jLNSUrpd10/HuJbVPsQ+zH67zO" +
            "dt5G4Hf5O+Ms9QTAcDfyD0YiNxYh/YLAXyGZUfZ/FVyO+fisEUyE8xU" +
            "B29hhn+IvnlRA08DkgCzW9WozzI64nm0NeVQkySMP1x7xRqHvYrLtqB" +
            "Wg6f3LetI3bACXQVuhbKSVFjO8rHuA7frl7DWAoxj4Bu/7v33Rt9wpA" +
            "YRuYmE55mwAAAABJRU5ErkJggg==",
          height: 19,
          width: 17
        }
      },
      PPhl: {
        text: "Hail",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAYAAAACsSQRAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASFwAAEhcBHtZa6AAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACYSURBVDiNncyr" +
            "DYNgAIXRg2mCx7BCXUdBMgeSIaoqOweyg6CYAIEkhBr+pCW8xefuPcZ" +
            "xtBYiPBFt7naQHCPySwhiNBPSIL6ClBMQKk8hSNHNkA7pGeQ9A0LvQw" +
            "geGFaQAY8jyGcFCH02EWQ7QChbRHBDfRCpcVtCioNAqPhDkKA9ibRIf" +
            "pHXSSD0mv7u6C8i/fRXXQRC1RfYM7vTTD2TnQAAAABJRU5ErkJggg==",
          height: 15,
          width: 17
        }
      },
      PPip: {
        text: "Ice pellets",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAYAAAACsSQRAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAASFwAAEhcBHtZa6AAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD5SURBVDiNndKx" +
            "SsJRFMfxj1BGW4VDQkNLSw3la0QQji7NBUGDow9hi20+h0GQz9DSkJN" +
            "75OBW2b/lN1iYmhcOh9/vnvs9l8NRFIW/AiW0UZpbtwDSQIHGShBsYh" +
            "jIEJurQFoBfCa3/gVBFWO84yx5jOp/IN10b0ffRneXgqCGCV6xHW8Hb" +
            "/Fry0D66Xr9y7+J358LQT2Fz1jDBR6S1/GS+/pMCMoYpOgUu/iInmAf" +
            "59EDlGdBmim4j97L4wJfOIj/GK/5A4IKRtmJoynwZWZ0NeWdBD5CZRr" +
            "SCf1u3nrPWIFOURRKOMRTBjnKYi06G9jKz4+hF+qq0fsGQJ/GtsuuuR" +
            "MAAAAASUVORK5CYII=",
          height: 15,
          width: 17
        }
      },
      PPrm: {
        text: "Rime",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAYAAAAiYZ4HAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAATEQAAExEBOWB/8AAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADcSURBVCiRfZA9" +
            "CsJAEIW/SEBIp5W1pWBn5yHS5gR2QoqcwUvYWXgCy7QhtYpXEAtBtBB" +
            "sMjYvYU02DjyYfT+zwwCkwAkYmRk+AGPgLC8HwID1n0AqzwEg1uP4J3" +
            "CRJwYIgauIhce8lHYFwprciHwBtxZe0jZmRh2YApUEHypg2gQUyiVmw" +
            "ETIxOWNzwkkEkuHK8UlvsAQuMswF0zcsPYNUJnZB9jpuRIAdtIao/vL" +
            "TFMfggGzH4/n7oVznaKtNys5te3puyvphwh4ClFbDz0D3kEQ7Ou+rXc" +
            "CvauovtUCBKqH02NUAAAAAElFTkSuQmCC",
          height: 16,
          width: 12
        }
      }
    },
    MM: {
      MMrp: {
        text: "Round polycrystalline",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAN/wAADf8B9IqyiQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADcSURBVBiVbdGhSsNRGI" +
            "bx37yBsTBYGsgYMqfBbFrxBhZN3oOgyeSQgU0Ek8kgGr0ILTIsWozCYFj" +
            "GwKbH4LvxDx444cDzfrzfc5RSlFKggTGeMMcjzlBfMQEHmAa6wynuscAH" +
            "dsNpYpaJbfQwRBfreE6gDpeZ0MYIPyj4xjE6+EolE9xiO9A1+rhJoIuH7" +
            "GCBExwE7qRfP+8hzjFfwzs28eLvHNVqtR4OA79iA29wVel8EWB5R5XOY2" +
            "jhs2JjB/vYqtiYorH0vJfAf55nGKw+JYFWKk0CTaK1uWR+Aai+ZHz0ufc" +
            "/AAAAAElFTkSuQmCC",
          height: 13,
          width: 13
        }
      },
      MMci: {
        text: "Crushed ice",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAASzgAAEs4Bex1pWQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE3SURBVDiNndKxS9ZRFM" +
            "bxj0MOIiIiQiIiOAiCoi4OKTS0RS3+A06KtAj9CW7i4OIoQmtTGThUWzi" +
            "1RQoikpgIioiiQovX4X1e+CFpvg2Xe8+5z/fce59zlVI0OtCJLxj8H7gL" +
            "P1Cw0Sj8FNuBv6OjEbgHO4Fv0F9K8Vi4D3uBrzKvPaoA+rEf6FuKnSSe/" +
            "Bc8gN8Rl5j3BG8SLz8ED+Iowg8xreAlRrLevA8exnEFbsZC4rdozfrib/" +
            "AYTiNYD9yEreSmckCtlXfgcZxV3nyG1Ur7fqENs4lXqvAznGfjPT5XChX" +
            "s5nbtOEzudR1+jstKn0eTn8A8XqEl8Hp0H6PxAtdJ1l3/E9MmcuUhzOAg" +
            "+6forhf4lORSDFtU+6rlnvEVvZWna8XcHTMnsaz2887xE+8wjaaq9hZED" +
            "pdEpECFkQAAAABJRU5ErkJggg==",
          height: 16,
          width: 16
        }
      }
    },
    DF: {
      DFdc: {
        text: "Partly decomposed",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAV6wAAFesBBGcFMAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADxSURBVDiNpdKrSkRRFA" +
            "bgzwsKIngBMRgmGAwWo+bp+gD6AOIDCD6AYJ9gFqwG44g2g8lgESyCQbB" +
            "PGBh0WfaRrc7tnBN2Wj/fgrV/EaHOww7usFwXaqKDwE0daA/dBL1jsyp0" +
            "gF6CXrEeEapAR/hK0DPWfmYloZOEBB6x8mteAjrLoHss/MuMgUziPIPam" +
            "OubHQFN4zKDrjAzMD8EmsV1Bl1gaujyAdB8anUBtTAx8iR9oCU8ZNDp2J" +
            "/0B1rFUwYdl6pOBjXwkpBPHJYudII28JagHvbLQsmxhY8EdbFbBSqwdoI" +
            "6aFaFCmwRt9iuA0WEb9vULhTE9LrXAAAAAElFTkSuQmCC",
          height: 18,
          width: 19
        }
      },
      DFbk: {
        text: "Wind-broken",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAS1gAAEtYBFoNx9gAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAC4SURBVCiRndMxSoNBEA" +
            "bQtzHNL4hFSCOk1T5I2jQ5hrVnyREsbO2FCCIqiHcQ0gUsTSU5wNgMQTT" +
            "F7r+wzc6+jx2YFRFaN0Z4wWUffIYPBJ5a8Tk2id9w0oJn2CZeoYsItXiB" +
            "XeJbHO1rlQGPiZf/apUBx7g6VCt5ofcaHDospVyXUrqqhD9PHeAm+72va" +
            "u8XHuIu8Tfm1QHo8JD4C9OG+XCK98SfuGicTs+J15j0+BumeMW4FUeEH8" +
            "3f8AnfiFybAAAAAElFTkSuQmCC",
          height: 15,
          width: 16
        }
      }
    },
    RG: {
      RGsr: {
        text: "Small rounded",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAASpgAAEqYBMp4FwQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA7SURBVAiZXczBCcAgFA" +
            "TRh20I9t9AcvEXoOWEX0C8eDBZmMvALFRceHCjQcd7EJA/mQXDd9P+7Ls" +
            "ItAVxVRAj8saA8AAAAABJRU5ErkJggg==",
          height: 5,
          width: 5
        }
      },
      RGlr: {
        text: "Large rounded",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATEQAAExEBOWB/8AAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACASURBVCiRldLRCcJAEE" +
            "XRk00LQsCqtIOsJQYVDPphAeki2Mb6swkRMWYH3t+9zMA8KSVTENHhldO" +
            "h/WAy2OCG9CNX7JZCvwLPUmbFDfCUNuBg+xxhLNgwBtQFG+qAoUAYAi4F" +
            "whkCnv7ff0c1/WGPxwrco5kfl6UKJ9/ViMtqvAGD/nbwFTl/UgAAAABJR" +
            "U5ErkJggg==",
          height: 12,
          width: 12
        }
      },
      RGwp: {
        text: "Wind packed",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAS1gAAEtYBFoNx9gAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADkSURBVCiRndPBK0RRFM" +
            "fxT+ixmAjDTlOyUkpiwdpC+UPs/UFWk4WVpV6U8jdIygJZWLC0wOLOwn3" +
            "jNl3z3nPq1L3n/r6/up1zhBC0TSzhCtvjRJPYwCamk3oP9wi4yIHLOMVH" +
            "FAV8o49DvMRaic4ovIe3BPwrz1CEEKTwHB4bwJ+Yr7gJv3Ec/1cXBY6qS" +
            "2qw2wCu4iBnsN7CYDVn8NzC4DZnULYwuBmeki4s4kt9Fx7QGXIRnsF5A/" +
            "gVOyOzYxbXUfCEfZz46XcFvsfaQmZylVF0h5XkYQpr6NUsli1covufzRw" +
            "A+YINQbda2N0AAAAASUVORK5CYII=",
          height: 15,
          width: 16
        }
      },
      RGxf: {
        text: "Faceted rounded",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAPCAYAAADQ4S5JAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATEQAAExEBOWB/8AAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAACySURBVCiRldAxagJREI" +
            "fx3y4pbYQU3sPW0iukTmFOF0mhgp2FB9Ab2Ak2ASWVIjIp8laei27cgT8" +
            "PZr6PeUyB0KLKNjC8pPeE3j/sPhdExKGJLoriZkM+6KCPM1YRcaozgWNE" +
            "wAg/qRf4xluaVb0/AcOsmeeCwT1h+UAILOrCOUmPhEMubBrAejYl1k3nr" +
            "NW6xLiF8CmdbPrEd74iQiW8Yt4AT9C9ClXwgRl22CbwPWd+AZFffoyyu6" +
            "J+AAAAAElFTkSuQmCC",
          height: 15,
          width: 12
        }
      }
    },
    FC: {
      FCso: {
        text: "Solid faceted",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABPSURBVCiR7dExCoBAEE" +
            "PRt2IlXsPK+9/BUrDyImI3Fq61O42VgSFNPhNIQUiqr35ib8hPGNRPa0R" +
            "4OyyILlsNfuhzqLjHPbA15GeMD5TSBUq1JZC/MAMeAAAAAElFTkSuQmCC",
          height: 13,
          width: 13
        }
      },
      FCsf: {
        text: "Near surface",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABvSURBVCiRldIxCgJBDA" +
            "XQtyAo4kEE7w829pZqI55Eu9iMsC7JjH4IgU9elwnhz6zafuHRuVtjPy8" +
            "Cl4iQDTY4trvP1GgBTrh2UQK2OJcoA63PUQVK1AMpGoEM3UcgQzECczT5" +
            "fqMbnuocsFuin/IGNZi6YIqhDfwAAAAASUVORK5CYII=",
          height: 13,
          width: 13
        }
      },
      FCxr: {
        text: "Rounded faceted",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUqAAAFKgB8UoAtwAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADKSURBVCiRvdCxSkNBEA" +
            "XQs48U+Qw1CEklWtj5LxZaCym0tLO0CZb6JQELKzu/RRC1cVNkVsbHI5A" +
            "UDgwzs3Pv3uGqtWqJGRZ4xXvUBWZ/cAHucI0v1IH8xBwlk24S4BkXOMMl" +
            "XtLuKvCmSeG2/ZZO7nAX+w9M4CEeln1Cj9gU7zucWMdjbdq9qLX+4CnG0" +
            "xGOYjgspZwPkSIOoh6XkNwqRql/w/cG7Dhd9Wvn3pAJyYxpw3bbnsbayv" +
            "8hZSMmpZTxBux+a3ayfKfzVhy7ex9SuoIWAAAAAElFTkSuQmCC",
          height: 16,
          width: 13
        }
      }
    },
    DH: {
      DHcp: {
        text: "Hollow cups",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD1SURBVDiNndMvS0NRGA" +
            "fgZ0GYCoaloRhMi6sGP8NA2wxm4/JAEJtFWF9RMBmXF8XgJ1icmFemIoL" +
            "O8hPm2P9wuLzv+zvPgXvuNRqNzFu4WZhZANQxQn0tBEX0g/RRXAdpBvhb" +
            "zZUQlDHED87zHKK8CtLO6bep71K3l0JQxTfesJveHt7Try6DdHPqxUT/M" +
            "v3uXAS1BF+wOTHbwmvmtakINtBL6HTGuzrLvIeNaUgjgScUZiAFPCfX+I" +
            "eghEGu8nDBV3wUZIDSONLK4H7Rf5L8Q/Kt1Cr4wgf2l0QO8Jl9FehEvVo" +
            "GGIOus68DJ3jE9orITi7h+BfPSUFU8uzJMwAAAABJRU5ErkJggg==",
          height: 17,
          width: 16
        }
      },
      DHpr: {
        text: "Hollow prisms",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAALCAYAAACZIGYHAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAThwAAE4cB1USnMgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAA4SURBVCiR7Y4xCgAgEM" +
             "NSEcT/f1anuh44eW5ipi5NK8BcUkOeiX4DUHjSbY8TgyQDlMT6xpc8L1" +
             "nJpAgVFi1yOwAAAABJRU5ErkJggg==",
          height: 11,
          width: 17
        }
      },
      DHch: {
        text: "Chains of depth hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEeSURBVDiNndKvS4NRGM" +
            "Xxj+BgohjEIAODFkGEVdF/wCRom8UqpuWBxSBYBIPNoMFiXTAZRdBsWJI" +
            "ZjEOYiAzna3mE64vbnOFyOec59/vcX7Is02/gaGBmAKCCDJV/QVBEMyBN" +
            "FP8DqQXge9SGgmAGbXxiJ+Y2ZoaBnEb389BnoU//BEEZXbyiFF4pdBflv" +
            "0Cuo+tej91d94VgPYJPGEv8abwkl7z+KwQFNCK0lYOfhP8YcwOF3yDVCN" +
            "xiJPEX8YF3zOMuctUfEEyhFU+5nNvFVSw6CL0auoWpFHIchYscYC38Z0w" +
            "k/mX4x6EtoIM3zCbBUTxEeDsHn4vjdWK9egT3c8Hd8O/TO0rqh1GvwyZu" +
            "MJ4LLcWfWenxqyfjETa+AFEaCR7yEaT3AAAAAElFTkSuQmCC",
          height: 16,
          width: 17
        }
      },
      DHla: {
        text: "Large striated",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAALCAYAAACZIGYHAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAS2gAAEtoBzfT+gQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADMSURBVCiRldKvbgJBEA" +
            "bw34aKq6homqayz4FpBY5HQGCow9fwVEhkq4vgCQiqIU01hmQwE3Jc745" +
            "0k8/M92d2Z1ZEqAMLRA8WTU9JIyil3GKHR+z9PU/4wXNEHM7Vxi3m2W3V" +
            "7Jb8Kvn5Rb0mGGCbolFHyCj5LQZtIZMUrNsCarp16iZtIZskp6h6ME3d5" +
            "iIE4ysb6cL4vJ1Sygde8Itjy1aa5wYP+IyIVxhm6h5V3zxqT6/wnb4hLH" +
            "V8oitB7+lbwiwnfv/PkDt84e0EuzQpK8njHK4AAAAASUVORK5CYII=",
          height: 11,
          width: 17
        }
      },
      DHxr: {
        text: "Rounding depth hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUPwAAFD8Bzyk6kQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD8SURBVDiNldMxSkNBFA" +
            "XQE0ihCJJGsA4RLIIkdRBXkF4Fd5DeyhWElHbuIKA7SCFYKIJt7ASrQIq" +
            "IVRD5Nq8Y5Wf8v5jmzb2nGOYpisKmgy4meI0zQTfbyWA9rFD8OSv0aoHo" +
            "YBHAA05xhseYLdCpA86i+ISdZL6Ll7ibVQIxjMIXDkvuj/AdmWEWRBPzC" +
            "F9n3vcmMnM0c+Aogh/Yy4D7+IzsqBREC8sIXea+RuSvIrtEqwwcR+ANWx" +
            "XAbbxHZ/wLRBvruDz/D0vQi+is0U7BafJNGjXABp6jO42ZQbIFx1WxBD1" +
            "J+gOxCQVu62IJepdslT7uN61SRfAgjP4P7EBFXeYjJaIAAAAASUVORK5C" +
            "YII=",
          height: 14,
          width: 20
        }
      }
    },
    SH: {
      // SHsu: {
      //   text: "Surface hoar",
      //   icon: {
      //     image: "iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAABHNC" +
      //       "SVQICAgIfAhkiAAAAAlwSFlzAAAStQAAErUB1jM0ZgAAABl0RVh0U29md" +
      //       "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEDSURBVDiNldIxTkJBFI" +
      //       "Xhj4qgiSUJGgsXQENlYa0LoKOwdgVUmBg7K2sqoomVS6Aimli4BhrjBkj" +
      //       "UWBjG5j6C8B6MxS3mnHP/ezMzcIYn7KaU5Bb28IxTGCPh+p+Qm+gbQxs/" +
      //       "+MJhJuAI39HXLsRhUB8yIY+RH6aUFGITM8xxvAVwEoAZmgtImP0wX1CrA" +
      //       "NTwGrn+Ql8K1DGNQK8Cch7+FPU1SIS6EXpDY8XbwXv43T9eybRJBC9X9K" +
      //       "vQJ2s9JZBOXPAH9kM7wGfona2QaBrF1Ls438d5VJqvgLRikzkuljZrZUM" +
      //       "CNIjpRQ0qsxsgjXil0tfKggSot+nf5EJquK36wUX9Amy9O8ZyCXfaAAAA" +
      //       "AElFTkSuQmCC",
      //     height: 16,
      //     width: 17
      //   }
      // },
      SHcv: {
        text: "Cavity hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATrwAAE68BY+aOwwAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEhSURBVDiNldO/LkRREM" +
            "fxz4klbKuRbCuIfQNBJSqFajuJmkiUXsAzbK/wBBqJSESEchuCDpVCpxC" +
            "RjGZwsXfDJJNz7+9853f+ZE6JCB9RSpnDPKYxkyNc4ybH04i4UImCFZwh" +
            "/phnWEUpOMRymj1iD1e4zVXlTqYwizVMpH4E63jAFsYiwqDEKDZxh07JI" +
            "wxHxKt/RCmlERFvVeclnKM9YPU2TrD4qVUmu3lBxwMMjpPp9jMYx1MCnT" +
            "7FnZx7wvgvg4Q2ErpHs6I3UwtsfKv5YTCEXoK7FX03tR6Gag0SXkj4BZO" +
            "ZL6kt/OJrLms/Cw4yA/t92RqDFp59te4zWn82SJOdisFOHVeqr/FHp43g" +
            "Mn/bdZ3a6FuNiHgtpWx/fNdx71O+cg44LiQGAAAAAElFTkSuQmCC",
          height: 16,
          width: 16
        }
      },
      SHxr: {
        text: "Rounding surface hoar",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUPwAAFD8Bzyk6kQAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEGSURBVDiNpdOxSkJhGM" +
            "bxnyDUEDgEzQ46NYmIS3QH7kHdgXNLd+CYU3fgVHfgZEsJ0ebQEDTqEDh" +
            "JBF/Lq5h6TmrDO5z3+T9/Dt/5DjTwiEpKyT6DajgaMEDC/T+ED+EYQDMe" +
            "Es72kJ0v9ZvzZS8WTyjsICtgGN1eSsk8KGMWwcUOwsvozFBeCCPsRPiOg" +
            "y1kh/iITmexXwJKmARwvYXwJtgJSmvCgNoBfeI4R3aCabDtX9kKWMQowN" +
            "sc4V0wIxQzhQG3Av5CdUN+iu9gWmt5xhv0ozDE0co5v0bW39jNEFYwjuJ" +
            "zXI8rvMRunPWr5n3F+tLBL88U9czeH1ejhi7eYrqo5XV+ABUCRU8Kk7Xf" +
            "AAAAAElFTkSuQmCC",
          height: 14,
          width: 20
        }
      }
    },
    MF: {
      MFcl: {
        text: "Clustered rounded",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATSQAAE0kBq98iNgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE9SURBVCiRfdK9S1xBFA" +
            "XwX96uViohnXYKARurVBbRMlq4iIW9YLCIH8FAYP8kLVZQQVuxslmw3MZ" +
            "C8SOlbJEgkbHwPpx97DpwGe45956Ze2aklKCO37jAI86xhQ8osBvYY9Ts" +
            "oha96jhD6hMtnAzgzqJXM4ArzOMTNnCXFd9gHePB3QTehHYk31JKyogRS" +
            "oG1Cvc98DZ0IxmrFE0F/ozRCjcRXLdAx+v6qnctx15gdQDXge1Qu0YDk/" +
            "iFP9kId/iJ6XiB0p/N8hVOBzj9XhyiVs5Uww4us4J9zGIOBxnexg8UKSU" +
            "q5qxkV65n+DAeglvKe4qKOVOxH6eU/pdgSukJR5F+7umo3KDh7ePUMnwo" +
            "M26xp6ci8BH3UbiHL+FDK7BbjAwUCJEF/Ovj+l+V39pXIERm4pke4tQWp" +
            "vvVvgBQxBeGqzKVKgAAAABJRU5ErkJggg==",
          height: 15,
          width: 16
        }
      },
      MFpc: {
        text: "Rounded polycrystals",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAYAAADtc08vAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAATSQAAE0kBq98iNgAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEoSURBVCiRfdOxLoRBFA" +
            "Xgj9UIhdaWKDQkCuIN0Ei8gG4RBUskeCSNgkaiEgWboPQCG7ZGQcMo9m5" +
            "2duya5OZmzj3n/DN37i+lBBUc4B5vuMUehiIOAntDA4eohNYwrpH6xAUu" +
            "B9RuMCLcE5rYQRXbeM3IzcAmIzcDPxVHSqillHQCW5lBWasF/gTvsakWp" +
            "FEc4wRjRa0amg94iM1uTvovsBuaB9HtFHc+wgyW+oiWMR0v0OnPnujkVd" +
            "Hhb8xn4gX8FJwrjMjmoI7njFDPDPYz/Dm47TkojrmZ3W2oqN1FbSPHh/W" +
            "uyciN1Bmz7nqMPNWDFl9Z1x2cSoZXdIdnrUdTGEygFcQzLEacBfaC8YEG" +
            "YbKKr6LjCZ9Y+cMfMChz2j9SK978HLP9uL9ZpERJOGFnRQAAAABJRU5Er" +
            "kJggg==",
          height: 15,
          width: 16
        }
      },
      MFsl: {
        text: "Slush",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABUAAAATCAYAAAB/TkaLAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAT2AAAE9gBFb9ciwAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGiSURBVDiNrdS9axRRFA" +
            "Xw39vFgAZJxC38KESwEQRBQQKLtSBYxEos3NLOUrCxFuxsLCyCjY2louA" +
            "/YECwlhCL2OymEOJH0PiRa5E7Zhyc3UW88HjzzrvnzJ3z3h0RAfO4hxW8" +
            "xzMsRIS2gfN4kfkryZ/PPT2sIRrjJ660CF7N/SZnLQu0lMAbLOJUDdvAX" +
            "EPwID7l/lLmLyY/smLvcnGpRpzBKPELDdGLiY8wU8MvJ77awV47McpZRH" +
            "zLKmGfP6PK38i8KtZznoXn+YYn6W8Xg5qvRxuVHsd27g8yv4eniT2G09h" +
            "KYAvDmvF3Wg7qbi1nWON/xckqqV8zOvAFt9BtEe3idk2sOuh+RCjVvYJS" +
            "ymHMYTUifpgQpZQ9OJH+Dn/jddH/FZ1pkkopB0opZ0sp+6dSndCKx+y0b" +
            "OXbNh6hN5Y3RnAWb2uC67XnZS2HOEn0pt0rcyaxBXxIfNDGHefpuZwfRM" +
            "TrtGoZDxPvtxHHiW7mfKiBV+vPrcwxn1+16iau4whu4Lu//Gim9bTY7ef" +
            "muP9Pp5/CnazuFT7iJa6N40SEX+Sf7qpmCqpWAAAAAElFTkSuQmCC",
          height: 19,
          width: 21
        }
      },
      MFcr: {
        text: "Melt-freeze crust",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAABwAAAAQCAYAAAAFzx/vAAAABH" +
            "NCSVQICAgIfAhkiAAAAAlwSFlzAAAK4gAACuIBdEbn2wAAABl0RVh0U" +
            "29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHJSURBVDiNvdU7" +
            "a1VBEAfw38k1JmhaEWwEHwQLEZMQonYWioUYEUJ8FL7QIle7gNroB7D" +
            "xC2inYmlKK0vBVKL4iGBjiAoaDDfEqKzFmSvr5dyQBHVhOMx//rNzdn" +
            "ZmtkgpyVdRFDsxggH0o4a3eIjbKaXpFv4mnMERbMVPTOIpHqSUnv0RI" +
            "KUkgtZwFQ3cRR2DGMLF2GQO9cynHthkcIbC5xLuYx5XUPvtkwV7hJcY" +
            "bBpbBaPxQ7dCGhhdgr8Xb2LvWh5wHM+xLiN3YAc2t2zSF6eaQ1+GF9i" +
            "ObS38HrzGePP6esN5ICOdw5fAv2EK+zP7MIYzfQQzkcJ5vMfhzL4vst" +
            "ELN3AnM14Ih0NxyrWBNarSjWP4HN81IaOYxcGMdw/XYQLnA+zE1/w0m" +
            "cM1PK7A3+FEBX4Wr1oKbAKmsTvAXfjYpgC2YAGdGbYRi+iq4PcoW2RD" +
            "6Hsw3eHvrGKZmA5lD/WH/gLdRVEcqOCewpOU0vcmkFL6oMzQSAX/OKZ" +
            "SSp9C749YlUUzg6PKO12Py8rqa1c0sziJLnTjtLIWKotmqbZYwA/Lb4" +
            "vFkPZt8d8bf5Wj7WbI6kbbCof3WOYzZoXDu2jOt+b618/TLzmbEEiG7" +
            "JCdAAAAAElFTkSuQmCC",
          height: 16,
          width: 28
        }
      }
    },
    IF: {
      IFil: {
        text: "Ice layer",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAICAYAAAAiJnXPAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAARagAAEWoBAFXniAAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAYSURBVBiVY2RgYPjPQC" +
            "JgIlXDqCZKNQEAsVMBD3cM+XcAAAAASUVORK5CYII=",
          height: 8,
          width: 13
        }
      },
      IFic: {
        text: "Ice column",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd/14OAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUGAAAFBgBD0W9egAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAZSURBVCiRY2RgYPjPQA" +
            "RgIkbRqMJRhVgBAIcrAR3H3g4iAAAAAElFTkSuQmCC",
          height: 15,
          width: 10
        }
      },
      IFbi: {
        text: "Basal ice",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAKCAYAAABrGwT5AAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUGAAAFBgBD0W9egAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABNSURBVCiRY2RgYPjPQC" +
            "ZgIlcjAwMDAwsS25aBgeENEXp4GRgYTsE4/6FY4v///wyEMAMDgwBMD9W" +
            "cncPIyPiFCD0cMAYjw0CF9sBpBgCtViSH9otqNAAAAABJRU5ErkJggg==",
          height: 10,
          width: 15
        }
      },
      IFrc: {
        text: "Rain crust",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAICAYAAADN5B7xAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUlwAAFJcBXLif8wAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAsSURBVBiVY2RgYPjPQA" +
            "JgIkUxAwMDAyMDA4MGSRr+/yfJReQ5SYFUDbQNJQAAeAVP4NdMGAAAAAB" +
            "JRU5ErkJggg==",
          height: 8,
          width: 12
        }
      },
      IFsc: {
        text: "Sun crust",
        icon: {
          image: "iVBORw0KGgoAAAANSUhEUgAAAAwAAAACCAYAAABsfz2XAAAABHNC" +
            "SVQICAgIfAhkiAAAAAlwSFlzAAAUlwAAFJcBXLif8wAAABl0RVh0U29md" +
            "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAXSURBVAiZY2RgYPjPQA" +
            "JgIkUxAwMDAwBeyAEDaN66zgAAAABJRU5ErkJggg==",
          height: 2,
          width: 12
        }
      }
    }
  };

  /**
   * Table of CAAML grain sizes.
   * Property name is the code value to store
   * Property value is the humanly-readable description
   * @memberof SnowProfile
   * @const {Object}
   */
  SnowProfile.CAAML_SIZE = {
    "very fine": "< 0.2",
    "fine": "0.2-0.5",
    "medium": "0.5-1.0",
    "coarse": "1.0-2.0",
    "very coarse": "2.0-5.0",
    "extreme": "> 5.0"
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
   * Table of CAAML hardness values (HardnessBaseEnumType).
   *
   * + CAAML_HARD[i][0] is the alpha string defined by CAAML 5.0.
   * + CAAML_HARD[i][1] is a boolean; whether to draw a line here.
   * @const
   * @type {string[]}
   * @memberof SnowProfile
   */
  SnowProfile.CAAML_HARD = [
    ['F-',    0],
    ['F',     1],
    ['F+',    0],
    ['F-4F',  0],
    ['4F-',   0],
    ['4F',    1],
    ['4F+',   0],
    ['4F-1F', 0],
    ['1F-',   0],
    ['1F',    1],
    ['1F+',   0],
    ['1F-P',  0],
    ['P-',    0],
    ['P',     1],
    ['P+',    0],
    ['P-K',   0],
    ['K-',    0],
    ['K',     1],
    ['K+',    0],
    ['K-I',   0],
    ['I',     1]
  ];

  /**
   * Vertical height in pixels of the SVG drawing
   *
   * @method
   * @memberof SnowProfile
   * @returns {number} Drawing height in pixels.
   */
  SnowProfile.drawingHeight = function() {
    return  SnowProfile.Cfg.TOP_LABEL_HT + 1 + (SnowProfile.pitDepth *
      SnowProfile.Cfg.DEPTH_SCALE) + 1 + SnowProfile.Cfg.HARD_LABEL_HT;
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

  // For debugging, show the bounding box
  SnowProfile.drawingBox = SnowProfile.drawing.rect(0, 0)
    .style({
       "fill-opacity": 0,
       stroke: 'red'
    });
  SnowProfile.drawing.add(SnowProfile.drawingBox);

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
   * Convert a snow layer depth value to a drawing Y axis position
   *
   * @method
   * @memberof SnowProfile
   * @param {number} depth Depth from the snow surface in cm.
   * @returns {number} Y position.
   */
  SnowProfile.depth2y = function(depthArg) {
    return (depthArg * SnowProfile.Cfg.DEPTH_SCALE) +
      SnowProfile.Cfg.HANDLE_MIN_Y;
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
    var i,
      numLayers = SnowProfile.snowLayers.length;

    // Hide the controls so they won't show in the PNG
    $.event.trigger("SnowProfileHideControls");

    // Scale the drawing to desired image size.
    var scaleFactor = SnowProfile.Cfg.IMAGE_WD / SnowProfile.drawing.width();
//    for (i = 0; i < numLayers; i++) {
//      SnowProfile.snowLayers[i].scale(scaleFactor);
//    }
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
//        for (i = 0; i < numLayers; i++) {
//          SnowProfile.snowLayers[i].scale(1);
//        }
        $.event.trigger("SnowProfileShowControls");
      }
    });

    // SnowProfile.stage.toDataURL({
    //   x: 0,
    //   y: 0,
    //   width: SnowProfile.Cfg.IMAGE_WD,
    //   height: scaleFactor * SnowProfile.stage.getHeight(),
    //   callback: function(dataUrl) {
    //     var newWin = window.open(dataUrl, "_blank");
    //     if (newWin === undefined) {
    //       alert("You must enable pop-ups for this site to use" +
    //         " the Preview button");
    //     }
    //     SnowProfile.stage.scale({x: 1, y: 1});
    //     $.event.trigger("SnowProfileShowControls");
    //   }
    // });
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
        new SnowProfile.Layer(0);
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
