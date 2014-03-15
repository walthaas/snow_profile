/**
  @file Defines the namespace and configuration for the snow profile editor.
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
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
    * Minimum depth that can be set by the user (cm)
    * @type {number}
    */
   MIN_SETTABLE_DEPTH: 50,

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
      FIXME: we need the concept to calculate ratio of pixels/cm but
        should find a better name for it.
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
     * Width in pixels of the image to be generated
     * @const
     * @type {number}
     */
    IMAGE_WD: 800,

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
     * @summary Total depth of the snow pack (cm)
     * @desc Distance in cm from the snow surface to the ground, as measured
     *   with a calibrated probe or by digging to the ground.  Null
     *   if this distance is not known.
     * @type {?number}
     */
    totalDepth: null,

    /**
     * @summary Pit depth (cm)
     * @desc Depth of the pit in cm from the snow surface.  Must
     *   be an integer >= 30.  Default 200.
     * @type {!number}
     */
    pitDepth: 200,

    /**
     * @summary Depth reference (snow surface or ground)
     * @desc  A single letter indicating whether snow depth is referenced
     *   to the snow surface ("s") or ground ("g").  Must be one or the
     *   other.  Default is "s".  Ground reference may be used only if
     *   the value of total snow depth (totalDepth) is known.
     * @type {!string}
     */
    depthRef: "s",

    /**
      Table of CAAML grain shapes.
      Property name is the code value to store.
      Property value is the humanly-readable description.
      @type {Object}
      @const
     */
    CAAML_SHAPE: {
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
          height: 17,
          width: 16
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
    },

    /**
      Table of CAAML sub-shapes
      @type {Object}
      @const
     */
    CAAML_SUBSHAPE: {
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
        PPnd:{
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
        SHsu: {
          text: "Surface hoar",
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
            image: "iVBORw0KGgoAAAANSUhEUgAAADQAAAAdCAYAAADl208VAAAABHNC" +
              "SVQICAgIfAhkiAAAAAlwSFlzAAAT9gAAE/YBIx4x4QAAABl0RVh0U29md" +
              "HdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATWSURBVFiFvdhv6J5TGA" +
              "fwz/2bic2M38YwEyus4Ycx2qbGyKyt7IUXeDFCkvJmKU0IUV4gb+ZPRl6" +
              "hRDEMSSTRsj/502wa2QobNvuHYW4v7uvuOb9n930/97PFqafTc1/f873O" +
              "dc51zrmuK8vzXK+WZdlYzMMCnIbjcQx+xSZsxgd4Mc/zrT0Jh3Mfi6sxG" +
              "5NwEo7CT/gBG/A6VuR5vqMnYZ7ntT+ciGfxJ/IWv7/wJmY28Qb3zMD+1Z" +
              "L7TzyDiY28NcpG4H78nhB+iQcxF0OYEP1VuBNrEuw/WIZxFdxH46nAlPg" +
              "1wXFVF/cVoXNdgt2DuzHQyqBQ+HZCsBGX9FrxGDsHbyRjt2BaIh/C94n8" +
              "DcxpyX05vkvGvo4jGw3CIL6KAfvwGEa1UdjFc22sZK44Z7PCxbbHt9245" +
              "gB4x8TulkZ9jrGVBmEk3gvgd5jVr8Iu5Wfjm8RNSgM34MyD5L4MPwbfWx" +
              "hRZdDDAfgbM3oQjsAUjOmBO67LTb7B+B5jjsXkli5Y8j4wzCBMxt4QPlh" +
              "DcAgW433sStzyMyzFcTXjhgK/E2fUYM7HC8mO5tiK5VjYYNTSwP6Bk1OD" +
              "XgjBaoyscZ9VibI8Dnd6nW/DohrFCzC/4vtheCi8ouTZrXiDUl0vYULF+" +
              "FFYH5jn45tBxVuwr2oFMTVWoLzxForrGIfG6r6SKL+9j7PwWrLTj4SugZ" +
              "BNwq3YkbjrERUcM3TewEFYFB8+qjkrK0P+CkY3TO6GZPsrXasLX+rdoeH" +
              "MhmFfBPbxGsxnIV8ktjPHHRXA20K2Wdf1WEP8XN3idOHG6FzhN7bgPTfc" +
              "+x9cWCG/N3FNq+PPpRXAV0N2U0sXGh9K96l49BLcJcH7eR/uuSzG3FMhm" +
              "x+y1QOKQJPikHe386L/uEK2X8vz/GfFwzygOFt1reT9pA1v1xxmVMjKuR" +
              "8/IA4SfkkRWZaNxkSF5V/3oXhd9FMaMKdHv74P3hI7tUJWzn1wQHHdwrg" +
              "Ukef5HoXlGU7tQ3Gp8KsGzIboT2/AdLcSu65CVs5924Ai54ATKoCrop/V" +
              "RmOWZRNCcY5PG6Al78wsy7I23Mkcqty0nPsPA4q3hWqffy/6e7MsG6yQd" +
              "7dHFTu6Ms/znQ24VYrIYSpu6UWaZdl0cSXjnQrI9Og30vwOjdTJc5Zrvr" +
              "luDdxenN3i1rop8LswuwE3WScDWNbmHeoVKQzpxHmbFOnyxJCNxkWG50B" +
              "L+riKV+gkhEsxTRF9lOd2sSIUKjOA/fOf7kghPvaK5aYrco80vtoWi1D+" +
              "34GbayZeF8uNUuRcKc9ehTumuparSL1VxXLJtvaKtg9VpMkf6kTbfyvC" +
              "kqcxqWZcm2h7Fl7Gt4kRW2MHr27Y4epoO4T95EMZTtEjm3Vg+dDROLGF" +
              "u9bnQ8kFkGasPSs3PRSeq5Pf7Ezc6GsMHST3HL0y1gB21xQeweEHoPB6" +
              "nYrRdlyICxQveo7fcN0B8I4ONysrRvU1ha4tT6s+69vulqLE9W4ydgvO" +
              "SeRnGV71eRdzW3LPVrwz5djeVZ9k8AjcFytZEqxS1MNmK6qnYxXx2kIs" +
              "wdoE229dbm1wLAzOsaHj4tCZ1vz24C5t63Jdyk/Ak4YXHJt+/2Xl9Hc8" +
              "oaZ2Uf6yIG9sEXnPw5WKWO3/rG2vV+RlK/IiYG5s/wKhe2zOmk4pTAAA" +
              "AABJRU5ErkJggg==",
            height: 29,
            width: 52
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
   @summary KineticJS stage
   @desc [Kinetic.Stage]{@link http://kineticjs.com/docs/Kinetic.Stage.html}
   object for the stage where the diagram will be drawn
   @type {object}
   @memberof SnowProfile
   */
  SnowProfile.stage = new Kinetic.Stage({
    container: 'snow_profile_diagram',
    width: SnowProfile.STAGE_WD,
    height: SnowProfile.STAGE_HT
  });

  /**
    Maximum Y value allowed for any handle (bottom of graph area)
    @type {number}
    @memberof SnowProfile
   */
  SnowProfile.handleMaxY = SnowProfile.TOP_LABEL_HT + 1 +
    (SnowProfile.DEPTH_SCALE * SnowProfile.pitDepth);

  /**
    @method
    @memberof SnowProfile
    @summary Recalculate the Y axis positions of all KineticJS objects whose
    position depends on the index of the layer in the snowpack.
   */
  SnowProfile.setIndexPositions = function() {
    var i,
      numLayers = SnowProfile.snowLayers.length;

    for (i = 0; i < numLayers; i++) {
      SnowProfile.snowLayers[i].setIndexPosition();
    }
  };

  /**
   @method
   @memberof SnowProfile
   @summary Convert a depth in cm to a Y axis position.
   @param {number} depth Depth from the snow surface in cm.
   @returns {number} Y position.
   */
  SnowProfile.depth2y = function(depthArg) {
    return (depthArg * (SnowProfile.GRAPH_HEIGHT / SnowProfile.MAX_DEPTH)) +
      SnowProfile.HANDLE_MIN_Y;
  };

  /**
   @event SnowProfileHideControls
   @memberof SnowProfile
   @type {object}
   */

  /**
   @event SnowProfileShowControls
   @memberof SnowProfile
   @type {object}
   */

  /**
   * @method
   * @memberof SnowProfile
   * @summary Produce a preview PNG in a new window
   * @fires ShowProfileHideControls
   * @fires ShowProfileShowControls
   */
  SnowProfile.preview = function() {

    // Hide the controls so they won't show in the PNG
    $.event.trigger("SnowProfileHideControls");
    var scaleFactor = SnowProfile.IMAGE_WD / SnowProfile.stage.getWidth();
    SnowProfile.stage.scale({x: scaleFactor, y: scaleFactor});

    // Open a new window and show the PNG in it
    SnowProfile.stage.toDataURL({
      x: 0,
      y: 0,
      width: SnowProfile.IMAGE_WD,
      height: scaleFactor * SnowProfile.stage.getHeight(),
      callback: function(dataUrl) {
        var newWin = window.open(dataUrl, "_blank");
        if (newWin === undefined) {
          alert("You must enable pop-ups for this site to use" +
            " the Preview button");
        }
        SnowProfile.stage.scale({x: 1, y: 1});
        $.event.trigger("SnowProfileShowControls");
      }
    });
  };

  /**
   @method
   @memberof SnowProfile
   @summary Initialize the container and the grid layer
   @fires SnowProfileHideControls
   */
  SnowProfile.init = function() {
    var i, numLayers;

    // Add the reference grid to it
    SnowProfile.stage.add(new SnowProfile.Grid());

    // Create the KineticJS layer
    SnowProfile.kineticJSLayer = new Kinetic.Layer();

    // Draw a horizontal line across the top of graph and description areas
    SnowProfile.kineticJSLayer.add(new Kinetic.Line({
      points: [SnowProfile.DEPTH_LABEL_WD + 1,
        SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2),
        SnowProfile.STAGE_WD - 3,
        SnowProfile.HANDLE_MIN_Y + (SnowProfile.HANDLE_SIZE / 2)],
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
