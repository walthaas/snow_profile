/**
 * @file Define the object that describes a snow layer
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */
/* global SVG */

(function($) {
  "use strict";

  /**
   * Object describing a single snow stratigraphy layer.
   * @param {number} depthArg Initial depth in cm of this layer from the top
   * of the snow pack.
   * @constructor
   * @listens SnowProfileAdjustGrid
   * @listens SnowProfileButtonClick
   * @listens SnowProfileHideControls
   * @listens SnowProfileShowControls
   */
  SnowProfile.Layer = function(depthArg) {

    // Reference this object inside an event handler
    var self = this;

    /**
     * Depth of the top of this snow layer in cm from the snow surface.
     *
     * Initialized to the argument passed to the constructor and adjusted
     * whenever the user moves the handle for this snow layer.
     * @type {number}
     */
    var depthVal = depthArg;

    /**
     * Features object associated with this layer
     */
    var featObj;

    /**
     * Features object describing the features of this Layer.
     */
    this.features = function(featArg) {
      if (featArg === undefined) {
        return featObj;
      }
      else {
        featObj = featArg;
      }
    };

    /**
     * Has the user touched the handle since this layer was created?
     *
     * Used to make an untouched handle throb visibly, to draw the user's
     * attention to the need to set the handle position.
     * @type {boolean}
     */
    var handleTouched = false;

    /**
     * Handle for the line at the top of the layer.
     *
     * The user drags and drops this handle to adjust depth and hardness.
     * @type {Object}
     */
    var handle = SnowProfile.drawing.rect(SnowProfile.Cfg.HANDLE_SIZE,
      SnowProfile.Cfg.HANDLE_SIZE)
      .x(SnowProfile.Cfg.HANDLE_INIT_X)
      .y(SnowProfile.depth2y(depthVal))
      .addClass("snow_profile_handle");

    /**
     * Process handle drag
     *
     * @callback
     * @method
     * @memberof handle
     * @param integer x X-axis position of upper-left corner of handle
     * @param integer y Y-axis position of upper-left corner of handle
     * @returns Object New position of handle
     *   + x: new X-axis position of upper-left corner of handle
     *   + y: new Y-axis position of upper-left corner of handle
     */
    handle.draggable(function(x, y) {
      var newX = x;
      var newY = y;
      i = self.getIndex();
      numLayers = SnowProfile.snowLayers.length;
      var mm;

      // Stop the animation
      handle.stop();
      handle.size(SnowProfile.Cfg.HANDLE_SIZE, SnowProfile.Cfg.HANDLE_SIZE);

      // X (hardness) position is bound by the edges of the graph.
      if (x < SnowProfile.Cfg.HANDLE_MIN_X) {
        newX = SnowProfile.Cfg.HANDLE_MIN_X;
      }
      else if (x > SnowProfile.Cfg.HANDLE_MAX_X) {
        newX = SnowProfile.Cfg.HANDLE_MAX_X;
      }

      // Y (depth) position is limited by the depth of the snow layers
      // above and below in the snow pack, or by air and ground.
      if (i === 0) {

        // This is the top (snow surface) layer.
        // Handle stays on the surface.
        newY = SnowProfile.Cfg.HANDLE_MIN_Y;
      }
      else if (i === (numLayers - 1)) {

        // This is the bottom layer.  The handle depth is constrained
        // between the layer above and GRAPH_HEIGHT.
        if (y > (SnowProfile.handleMaxY)) {
          newY = SnowProfile.handleMaxY;
        }
        else if (y < SnowProfile.snowLayers[i - 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
        }
      }
      else {

        // This layer is below the surface and above the bottom.
        // The handle depth is constrained between layers above and below.
        if (y > SnowProfile.snowLayers[i + 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i + 1].handleGetY() - 1;
        }
        else if (y < SnowProfile.snowLayers[i - 1].handleGetY()) {
          newY = SnowProfile.snowLayers[i - 1].handleGetY() + 1;
        }
      }

      // Adjust the horizontal (hardness) position
      featObj.hardness(SnowProfile.x2code(newX));

      // Adjust the vertical (depth) position
      depthVal = SnowProfile.y2depth(newY);

      // Set the text information floating to the right of the graph
      if (SnowProfile.depthRef === "s") {

         // Depth is referred to the snow surface
         mm = Math.round(depthVal * 10) / 10;
      }
      else {

        // Depth is referred to the ground
        mm = Math.round((SnowProfile.totalDepth - depthVal) * 10) / 10;
      }
      handleLoc.text( '(' + mm + ', ' +
        SnowProfile.x2code(newX) + ')');
      handleLoc.y(newY);

      // Adjust the rectangle that outlines this layer
      self.setLayerOutline();

      // If this is not the top snow layer, update the snow layer above.
      if (i !== 0) {
        SnowProfile.snowLayers[i - 1].setLayerOutline();
      }

      // Lay out the features
      SnowProfile.layout();

      return {
        x: newX,
        y: newY
      };
    }); // handle.draggable(function

    /**
     * Animate the uninitialized handle to draw the user's attention
     *
     * For some reason this must be done after handle.draggable() not before.
     */
    handle.animate({ease: SVG.easing.backInOut, duration: '1000'})
     .size(SnowProfile.Cfg.HANDLE_SIZE / 1.4, SnowProfile.Cfg.HANDLE_SIZE / 1.4)
     .loop();

    /**
     * Text to show current handle location.
     *
     * The text appears to the right of the grid, at the same Y position as the
     * handle.  The depth value is in cm and tenths referenced according to the
     * grid scale.  This text is normally hidden, and shows when the mouse is
     * over the handle.
     * @type {Object}
     */
    var handleLoc = SnowProfile.drawing.text("")
      .font({
        size: 12,
        style: 'bold',
        family: 'sans-serif',
        fill: SnowProfile.Cfg.LABEL_COLOR
      })
      .x(SnowProfile.Cfg.DEPTH_LABEL_WD + 1 + SnowProfile.Cfg.GRAPH_WIDTH + 10)
      .y(SnowProfile.depth2y(depthVal))
      .hide();
    SnowProfile.mainGroup.add(handleLoc);

    /**
     * "Insert" button
     *
     * Insert button at the bottom of this layer.  When clicked, another layer
     * is inserted below this layer.
     * @type {Object}
     */
    this.insertButton = new SnowProfile.Button("Insert");

    /**
     * Define a diagonal line from the bottom of this layer right to the
     * line below the description of this layer.
     * @type {Object}
     */
    var diagLine = SnowProfile.drawing.line(0, 0, 0, 0)
      .stroke({
        color: SnowProfile.Cfg.GRID_COLOR,
        width: 1
      });
    SnowProfile.mainGroup.add(diagLine);

    /**
     * Define a rectangle to outline the layer
     * @type {Object}
     */
    var layerOutline = SnowProfile.drawing.rect(0, 0)
      .addClass('snow_profile_layer_outline')
      .style({
        fill: 'white',
        opacity: 0.85,
        stroke: '#000'
       })
      .x(SnowProfile.Cfg.DEPTH_LABEL_WD + 1)
      .y(0);
    SnowProfile.mainGroup.add(layerOutline);

    /**
     * Get or set depth in cm of this snow layer
     * @param {number} [depthArg] - Depth of the top of this snow layer in cm
     * @returns {number} Depth of the snow layer if param omitted.
     */
    this.depth = function(depthArg) {
      if (depthArg === undefined) {
        return depthVal;
      }
      else {
        depthVal = depthArg;
      }
    };

    /**
     * Get index of this object in snowLayers[]
     * @returns {number} Integer index into snowLayers[]
     */
    this.getIndex = function() {
      numLayers = SnowProfile.snowLayers.length;
      for (i = 0; i < numLayers; i++) {
        if (SnowProfile.snowLayers[i] === self) {
          return i;
        }
      }
      console.error("Object not found in snowLayers[]");
    };

    /**
     * Make the handle visible
     */
    function handleVisible() {
      handle.show();
    }

    /**
     * Make the handle invisible
     */
    function handleInvisible() {
      handle.hide();
    }

    /**
     * Remove and destroy all SVG objects belonging to this snow layer
     */
    function destroy() {
      handle.off('mouseup mousedown mouseover mouseout');
      $(document).unbind("SnowProfileHideControls", handleInvisible);
      $(document).unbind("SnowProfileShowControls", handleVisible);
      $(document).unbind("SnowProfileAdjustGrid", self.draw);
      handle.remove();
      handleLoc.remove();
      layerOutline.remove();
      diagLine.remove();
      featObj.destroy();
      self.insertButton.destroy();
      SnowProfile.layout();
    }

    /**
     * Define end points of a diagonal line from the handle of the layer below
     * this layer to the line below the description of this layer.
     * @returns {number[]} Two-dimensional array of numbers of the starting
     * and ending points for the diagonal line.
     */
    function diagLinePts() {
      i = self.getIndex();
      numLayers = SnowProfile.snowLayers.length;
      var xLeft,
      yLeft,
      xRight,
      yRight,
      points;

      if (i === (numLayers - 1)) {

        // This snow layer is the bottom snow layer.  The Y dimension of the
        // left end of the line is the bottom of the graph
        yLeft = SnowProfile.handleMaxY + (SnowProfile.Cfg.HANDLE_SIZE / 2);
      }
      else {

        // This is not the bottom snow layer, so the Y dimension of the left end
        // is the Y of the handle of the snow layer below this snow layer.
        yLeft = SnowProfile.snowLayers[i + 1].handleGetY() +
          SnowProfile.Cfg.HANDLE_SIZE / 2;
      }

      // Y dimension of the right end is the Y of the line below the
      // description of this snow layer.
      yRight = featObj.lineBelowY();

      // X dimension of the left end is the right edge of the graph
      xLeft = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 + SnowProfile.Cfg.GRAPH_WIDTH;

      // X dimension of the right end is the left end of the line
      // below the description of this snow layer.
      xRight = SnowProfile.Cfg.DEPTH_LABEL_WD + 1 +
        SnowProfile.Cfg.GRAPH_WIDTH + 1 + SnowProfile.Cfg.CTRLS_WD - 3;
      points = [xLeft, yLeft, xRight, yRight];
      return points;
    } // function diagLinePts()

    /**
     * Delete this layer and make necessary adjustments
     */
    this.deleteLayer = function() {
      i = self.getIndex();
      numLayers = SnowProfile.snowLayers.length;

      // Remove this Layer from the snowLayers array
      SnowProfile.snowLayers.splice(i, 1);

      // Destroy SVG objects of this layer
      destroy();

      // If the layer we just removed was not the top layer,
      // tell the layer above to adjust itself.
      if (i > 0) {
        SnowProfile.snowLayers[i - 1].draw();
      }
      else {

        // We just removed the top layer.  The layer that was
        // below it is the new top layer so set its depth.
        SnowProfile.snowLayers[0].depth(0);
      }

      // If the layer we just removed was not the bottom layer,
      // tell the layer below to adjust itself.
      if (i !== (numLayers - 1)) {
        SnowProfile.snowLayers[i].draw();
      }
      numLayers--;
    }; // this.deleteLayer = function();

    /**
     * Return the current X position of the handle
     * @returns {number}
     */
    this.handleGetX = function() {
      return handle.x();
    };

    /**
     * Return the current Y position of the handle
     * @returns {number}
     */
    this.handleGetY = function() {
      return handle.y();
    };

    /**
     * Set position and length of the diagonal line at bottom of this layer
     */
    this.setDiagLine = function() {
      diagLine.plot.apply(diagLine, diagLinePts());
    };

    /**
     * Set coordinates of the layer outline
     *
     * This is a rectangle that shows the layer against the reference grid.
     */
    this.setLayerOutline = function() {
      i = self.getIndex();
      numLayers = SnowProfile.snowLayers.length;
      var yTop = handle.y() + (SnowProfile.Cfg.HANDLE_SIZE / 2);
      var yBottom = SnowProfile.Cfg.HANDLE_SIZE / 2;
      if (i === (numLayers - 1)) {

        // This is the bottom layer so bottom Y is bottom of graph
        yBottom += SnowProfile.handleMaxY;
      }
      else {

        // Not the bottom layer so bottom Y is top of next lower layer
        yBottom += SnowProfile.snowLayers[i + 1].handleGetY();
      }

      if (handle.x() !== SnowProfile.Cfg.HANDLE_INIT_X) {
        layerOutline.width(handle.x() - SnowProfile.Cfg.DEPTH_LABEL_WD - 1 +
          (SnowProfile.Cfg.HANDLE_SIZE / 2));
      }
      layerOutline.y(yTop);
      layerOutline.height(yBottom - yTop);
    };

    /**
     * Draw this layer's handle and outline from depth and hardness values.
     *
     * Sets the layer outline of this layer and the layer above, if any.
     */
    this.draw = function() {
      i = self.getIndex();

      // Set handle X from hardness
      if (handleTouched) {
        handle.x(SnowProfile.code2x(featObj.hardness()));
      }
      else {
        handle.x(SnowProfile.Cfg.HANDLE_INIT_X);
      }

      // Set handle Y from depth
      handle.y(SnowProfile.depth2y(depthVal));

      // Adjust the rectangle that outlines this layer
      self.setLayerOutline();

      // Adjust the outline of the layer above, if any
      if (i !== 0) {
        SnowProfile.snowLayers[i - 1].setLayerOutline();
      }
    }; // this.draw = function() {

    /**
     * Push this layer down to make room to insert a layer above.
     *
     * Add an increment to the depth of this layer and all layers below
     * until there is enough space or the bottom is reached.
     * @return {boolean} Insert successful?
     */
    this.pushDown = function() {
      i = self.getIndex();
      numLayers = SnowProfile.snowLayers.length;
      // Is this the bottom layer?
      if (i !== (numLayers - 1)) {

        // This isn't the bottom layer so we need to push it down.  How much
        // space is there between this snow layer and the snow layer below?
        var spaceBelow = SnowProfile.snowLayers[i + 1].depth() - depthVal;
        if (spaceBelow < (2 * SnowProfile.Cfg.INS_INCR)) {

          // Not enough so we need to make space below this snow layer.
          if (!SnowProfile.snowLayers[i + 1].pushDown()) {
            return false;
          }
        }
      }

      // Refuse to push below the bottom of the pit
      if ((depthVal + SnowProfile.Cfg.INS_INCR) >= SnowProfile.pitDepth) {
        alert('No room to insert another layer!');
        return false;
      }

      // Add the insertion increment to this layer
      depthVal += SnowProfile.Cfg.INS_INCR;
      self.draw();
      return true;
    };

    // Main line of constructor
    // Insert this Layer in the appropriate place in the snow pack.
    var i,
      numLayers = SnowProfile.snowLayers.length,
      inserted = false,
      thisHandle,
      thisInsert;

    // Insert this snow layer above the first snow layer that is
    // at the same depth or deeper.
    for (i = 0; i < numLayers; i++) {
      thisHandle = SnowProfile.handlesGroup.get(i);
      thisInsert = SnowProfile.insertGroup.get(i);
      if (SnowProfile.snowLayers[i].depth() >= depthVal) {

        // Insertion point found, we need to insert above snowLayers[i].
        SnowProfile.snowLayers.splice(i, 0, this);
        thisHandle.before(handle);
        thisInsert.before(self.insertButton.getButtonGroup());
        inserted = true;
        break;
      }
    }

    // If no deeper snow layer was found, add this layer at the bottom.
    // This also handles the initial case where there were no snow layers.
    if (!inserted) {
      SnowProfile.snowLayers.push(this);
      SnowProfile.handlesGroup.add(handle);
      SnowProfile.insertGroup.add(self.insertButton.getButtonGroup());
    }

    // Listen for "SnowProfileHideControls" events
    $(document).bind("SnowProfileHideControls", handleInvisible);

    // Listen for "SnowProfileShowControls" events
    $(document).bind("SnowProfileShowControls", handleVisible);

    // Listen for "SnowProfileAdjustGrid" events
    $(document).bind("SnowProfileAdjustGrid", self.draw);

    /**
     * When mouse hovers over handle, show handle location
     *
     * @callback
     */
    handle.mouseover(function() {
      handle.style('cursor', 'pointer');
      if (handleTouched) {
        handleLoc.show();
      }
    });

    /**
     Style the cursor for the handle
     @callback
     */
    handle.mouseout(function() {
      handleLoc.hide();
    });

    /**
     When the handle is in use, show its location to the right.
     @callback
     */
    handle.mousedown(function() {
      handleTouched = true;
    });

    /**
     * When the mouse releases the handle, stop showing its location.
     * Then draw the layer from stored hardness code and depth value.
     * This has the effect of causing the handle and layer outline X values
     * to snap to the next lowest discrete hardness code.
     * @callback
     */
    handle.mouseup(function() {
      handleLoc.hide();
      handle.x(SnowProfile.code2x(featObj.hardness()));
      self.draw();
    });

    // When Insert button clicked, insert a snow layer below this one.
    $(document).bind("SnowProfileButtonClick", function(evt, extra) {

      if (extra.buttonObj === self.insertButton) {
        i = self.getIndex();
        numLayers = SnowProfile.snowLayers.length;
        var spaceBelow;

        // Is this the bottom layer?
        if (i === (numLayers - 1)) {
          // Inserting below the bottom layer
          if ((depthVal + SnowProfile.Cfg.INS_INCR) >= SnowProfile.pitDepth) {

            // Can't insert, no room
            alert('No room to insert another layer!');
            return;
          }
          spaceBelow = SnowProfile.pitDepth - depthVal;
        }
        else {

          // We need space for a layer below this one.  Calculate the space
          // available between this layer and the layer below it.
          spaceBelow = SnowProfile.snowLayers[i + 1].depth() - depthVal;
          if (spaceBelow < ( 2 * SnowProfile.Cfg.INS_INCR)) {

            // Not enough so we need to make space below this snow layer.
            if (!SnowProfile.snowLayers[i + 1].pushDown()) {

              // Couldn't make space, insertion fails
              return;
            }
          }
        }
        SnowProfile.newLayer(depthVal + (spaceBelow / 2));
      }
    });
  }; // function SnowProfile.Layer()
})(jQuery);

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
