/**
 * @file Common defines for Mocha tests
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */
exports.testURL = 'file://' + process.cwd() + '/test/lib/test.html';
//exports.testURL = 'file://' + process.cwd() + '/../snow_profile.html';
//exports.testURL = 'http://sandbox.utahavalanchecenter.org/snow_profile/snow_profile.html';
exports.buttonsXpath = "//*[name()='svg']/*[name()='g']/*[name()='g']" +
  "/*[name()='g']/*[name()='g']";
exports.handleXpath = "//*[name()='svg']/*[name()='g']/*[name()='g']" +
  "/*[name()='g']/*[name()='rect'][@class='snow_profile_handle']";


/**
 * Click last Insert button, wait until layer is created.
 */
exports.clickLastInsert = function(sw, driver) {

  var numButtons,
    insertStarted = false,
    insertDone = false;

  driver.wait(function() {
    if (!insertStarted) {
      insertStarted = true;
      driver.findElements(sw.By.xpath(
        exports.buttonsXpath + "[@class='snow_profile_button Insert']"))
        .then(function(buttons) {
          numButtons = buttons.length;
          driver.findElement(sw.By.xpath(
            exports.buttonsXpath +
            "[@class='snow_profile_button Insert'][" + numButtons + "]"))
          .click();
        });
    }
    driver.isElementPresent(sw.By.xpath(
      exports.buttonsXpath +
      "[@class='snow_profile_button Edit'][" + numButtons + "]"))
      .then(function(done) {
        insertDone = done;
      });
    return insertDone;
    }, 2000, "clickLastInsert didn't finish");
}

/**
 * Store comment into popup comment field.
 */
function setFeaturesComment(sw, driver, comment) {
  "use strict";

  var cmdStr = [],
    commentDone = false,
    i;

  if ((comment === null) || (comment === undefined)) {
    return;
  }

  // If there is existing comment text, erase it
  driver.executeScript('return $("#snow_profile_comment").val()')
    .then(function(val) {
      if (val.length > 0) {
        for (i = 0; i < val.length; i++) {
          cmdStr.push(sw.Key.BACK_SPACE);
        }
        cmdStr.push(sw.Key.NULL);
      }
    });

  // After backspacing over existing contents of input box,
  // type in the comment
  driver.findElement(sw.By.css('#snow_profile_comment'))
    .then(function(elmt) {
      cmdStr.push(comment);
      elmt.sendKeys.apply(elmt, cmdStr);
    });

  // Wait until new text is stored
  driver.wait(function() {
    driver.executeScript('return $("#snow_profile_comment").val()')
      .then(function(val) {
        if (val === comment) {
          commentDone = true;
        }
    });
    return commentDone;
  }, 2000, "comment wasn't stored");
}

/**
 * Set grain shape.
 */
function setFeaturesShape(sw, driver, shape) {
  "use strict";

  var primaryShape,
    primarySubShape,
    secondaryShape,
    secondarySubShape;

  // Shape is a string specifying primary shape, or an array of two
  // strings specifying primary or seconday shape.  May be null.
  if ((shape === null) && (shape === undefined)) {
    return;
  }

  // If shape info was supplied, parse the info into
  // primary and secondary shape and subshape
  if (Object.prototype.toString.call(shape) === '[object Array]') {
    if (shape[0].length === 4) {
      primaryShape = shape[0].substr(0,2);
      primarySubShape = shape[0];
    }
    else {
      primaryShape = shape[0];
    }
    if (shape[1].length === 4) {
      secondaryShape = shape[1].substr(0,2);
      secondarySubShape = shape[1];
    }
    else {
      secondaryShape = shape[1];
    }
  }
  else {
    if (shape.length === 4) {
      primaryShape = shape.substr(0,2);
      primarySubShape = shape;
    }
    else {
      primaryShape = shape;
    }
  }

  // Store primary shape info
  driver.findElement(sw.By.xpath(
    '//select[@id="snow_profile_primary_grain_shape"]/option[@value="' +
    primaryShape + '"]'))
    .click();

  // If primary subshape info found, store that
  if (primarySubShape !== undefined) {
    driver.wait(function() {
      return driver.isElementPresent(sw.By.xpath(
        '//select[@id="snow_profile_primary_grain_subshape_' + primaryShape +
        '"]'));
      }, 2000, 'subselect for ' + primaryShape + ' not found')
      .then(function() {
         driver.findElement(sw.By.xpath(
          '//select[@id="snow_profile_primary_grain_subshape_' +
          primaryShape + '"]/option[@value="' + primarySubShape + '"]'))
          .click();
      });
  }

  // If secondary shape info found, store that
  if (secondaryShape !== undefined) {
    driver.wait(function() {
      return driver.isElementPresent(sw.By.xpath(
        '//select[@id="snow_profile_secondary_grain_select"]'));
      }, 2000, 'snow_profile_secondary_grain_select not found')
      .then(function() {
        driver.findElement(sw.By.xpath(
          '//select[@id="snow_profile_secondary_grain_select"]/option[@value="'
          + secondaryShape + '"]'))
          .click();
      });
    if (secondarySubShape !== undefined) {
      driver.wait(function() {
        return driver.isElementPresent(sw.By.xpath(
          '//select[@id="snow_profile_secondary_grain_subshape_' +
          secondaryShape + '"]'));
      }, 2000, 'snow_profile_secondary_grain_subshape select not found')
      .then(function() {
        driver.findElement(sw.By.xpath(
          '//select[@id="snow_profile_secondary_grain_subshape_' +
          secondaryShape +'"]/option[@value="' + secondarySubShape +
          '"]'))
          .click();
      });
    }
  }
}

/**
 * Set grain size.
 */
function setFeaturesSize(sw, driver, size) {
  "use strict";

  var cmdStrMin = [],
    cmdStrMax = [],
    i,
    minDone = false,
    maxDone = false,
    sizeMin,
    sizeMax;

  // Size is a number specifying grain size, or an array of two
  // numbers specifying a range of sizes.  May be null.
  if ((size === null) || (size === undefined)) {
    return;
  }

  if (Object.prototype.toString.call(size) === '[object Array]') {
    sizeMin = String(size[0]);
    sizeMax = String(size[1]);
  }
  else {
    sizeMin = String(size);
  }

  // If there is existing minimum grain size, erase it
  driver.executeScript('return $("#snow_profile_grain_size_min").val()')
    .then(function(val) {
      if (val.length > 0) {
        for (i = 0; i < val.length; i++) {
          cmdStrMin.push(sw.Key.BACK_SPACE);
        }
        cmdStrMin.push(sw.Key.NULL);
      }
    });

  // After backspacing over existing contents of input box,
  // type in the minimum grain size
  driver.findElement(sw.By.css('#snow_profile_grain_size_min'))
    .then(function(elmt) {
      cmdStrMin.push(sizeMin);
      elmt.sendKeys.apply(elmt, cmdStrMin);
    });

  // Wait until new minimum size is stored
  driver.wait(function() {
    driver.executeScript('return $("#snow_profile_grain_size_min").val()')
      .then(function(val) {
        if (val === sizeMin) {
          minDone = true;
        }
    });
    return minDone;
  }, 2000, "minimum grain size wasn't stored");

  if (sizeMax !== undefined) {
    // If there is existing maximum grain size, erase it
    driver.executeScript('return $("#snow_profile_grain_size_max").val()')
      .then(function(val) {
        if (val.length > 0) {
          for (i = 0; i < val.length; i++) {
            cmdStrMax.push(sw.Key.BACK_SPACE);
          }
          cmdStrMax.push(sw.Key.NULL);
        }
      });

    // After backspacing over existing contents of input box,
    // type in the maximum grain size
    driver.findElement(sw.By.css('#snow_profile_grain_size_max'))
      .then(function(elmt) {
        cmdStrMax.push(sizeMax);
        elmt.sendKeys.apply(elmt, cmdStrMax);
      });

    // Wait until new maximum size is stored
    driver.wait(function() {
      driver.executeScript('return $("#snow_profile_grain_size_max").val()')
        .then(function(val) {
          if (val === sizeMax) {
            maxDone = true;
          }
      });
      return maxDone;
    }, 2000, "maximum grain size wasn't stored");
  }
}

/**
 * Set layer features
 *
 * @param {object} sw
 * @param {object} driver
 * @param {number} index Layer number. Top layer is zero.
 * @param {string} shape
 * @param {number} size
 * @param {string} comment
 */
exports.setFeatures = function setFeatures(sw, driver, index, shape, size,
  comment) {
  "use strict";

  var popupDisplayed;


  // Click the Edit button for the layer to open the popup.
  driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='g']/*[name()='g']/*[name()='g']" +
      "[@class='snow_profile_button Edit'][" + (index + 1) + "]"))
  .click();

  driver.wait(function() {
    return driver.findElement(sw.By.css('div#snow_profile_popup'))
      .isDisplayed();
    }, 2000, 'div#snow_profile_popup not found')
    .then(function() {

      // Set grain shape
      setFeaturesShape(sw, driver, shape);

      // Set grain size
      setFeaturesSize(sw, driver, size);

      // Set comment
      setFeaturesComment(sw, driver, comment);

      // Click the Done button to save the features
      driver.findElement(sw.By.xpath('//button[.="Done"]')).click();

      // Wait for the popup to disappear
      driver.wait(function() {
        driver.findElement(sw.By.css('div#snow_profile_popup'))
          .then(function(popup) {
            popupDisplayed = popup.isDisplayed();
          });
        return !popupDisplayed;
      }, 2000, "popup didn't go away");
    });
}

/**
 * Move a handle to specified depth and hardness
 *
 * Returns when the move is complete.
 * @param {Object} sw
 * @param {Object} driver
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Target depth to move to, in cm from surface.
 * @param {string} hardness Hand hardness code.
 */
exports.moveHandle = function moveHandle(sw, driver, index,
  depth, hardness, comment) {
  "use strict";

  var depthProm,
    handle,
    handleProm,
    hardProm,
    moveDone = false,
    moveStarted = false,
    newX,
    newY,
    offsetX,
    offsetY,
    xNow,
    yNow;


  // Wait for the handle to appear
  driver.wait(function() {
    return driver.isElementPresent(sw.By.xpath(
      exports.handleXpath + "[" + String(index + 1) + "]"));
  }, 2000, "handle " + index + " didn't appear")
    .then(function() {
      driver.wait(function() {
        if (!moveStarted) {
          handleProm = driver.findElement(sw.By.xpath(
            exports.handleXpath + "[" + String(index + 1) + "]"));
          depthProm = driver.executeScript(
            "return window.SnowProfile.depth2y(" + depth + ");");
          hardProm = driver.executeScript(
            "return window.SnowProfile.code2x('" + hardness + "')");
          sw.promise.all([handleProm, depthProm, hardProm])
            .then(function(arr) {
              handle = arr[0];
              newX = arr[2];
              newY = arr[1];
              handle.getAttribute('x')
                .then(function(x) {
                  xNow = x;
                })
                .then(function() {
                  handle.getAttribute('y')
                    .then(function(y) {
                      yNow = y;
                      offsetX = Math.ceil(newX - xNow);
                      offsetY = Math.ceil(newY - yNow);
                      new sw.ActionSequence(driver)
                        .dragAndDrop(handle, {x: offsetX, y: offsetY})
                        .perform()
                        .then(function() {
                          moveDone = true;
                        });
                    });
                });
            });
        }
        return moveDone;
      }, 2000, "handle didn't move");
    });
}

/**
 * Schedule command to test position of a handle.
 *
 * @param {Object} sw
 * @param {Object} driver
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Expected depth in cm
 * @param {string} hardness Expected hand hardness code
 */
exports.testHandle = function testHandle(sw, driver, chai, index,
  depth, hardness) {

  var depthPromise,
    hardnessPromise,
    xNow,
    yNow;

  driver.findElement(sw.By.xpath(
    exports.handleXpath + "[" + (index + 1) + "]"))
    .then(function(handle) {
      handle.getAttribute('x')
        .then(function(x) {
          xNow = x;
        })
        .then(function() {
          handle.getAttribute('y')
           .then(function(y) {
              yNow = y;
              depthPromise =
                driver.executeScript("return window.SnowProfile.y2depth('" +
                yNow + "')");
              hardnessPromise =
                driver.executeScript("return window.SnowProfile.x2code('" +
                Math.ceil(xNow) + "')");
              sw.promise.all([depthPromise, hardnessPromise])
                .then(function(arr) {
                  chai.expect(arr[0]).to.be.within(depth - 1, depth + 1,
                    "wrong depth");
                  chai.expect(arr[1]).to.equal(hardness, "wrong hardness");
                });
           });
        });
   });
}

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
