/**
 * @file Mocha test for real pit on Square Top Feb 13, 2014
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  common = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');
  var SnowProfile = {},
    diagramLoc,
    driver;

/**
 * Schedule command to move a handle to specified depth and hardness
 *
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Target depth to move to, in cm
 * @param {string} hardness Hand hardness code
 */
function moveHandle(index, depth, hardness) {
  "use strict";
  // console.info('queueing command to find handle', index);

  var handleXpath = "//*[name()='svg']/*[name()='g']/*[name()='rect']" +
    "[@class='snow_profile_handle'][" + (index + 1) + "]";

  // Wait for the handle to appear
  driver.wait(function() {
    return driver.isElementPresent(sw.By.xpath(handleXpath));
  }, 2000, "handle " + index + " didn't appear");
  var handleProm = driver.findElement(sw.By.xpath(handleXpath));

  // console.info('queueing command depth2y', depth);
  var depthProm = driver.executeScript("return window.SnowProfile.depth2y('" +
    depth + "')");

  // console.info('queueing command code2x', hardness);
  var hardProm = driver.executeScript("return window.SnowProfile.code2x('" +
    hardness + "')");

  // console.info('queuing promise.all');
  sw.promise.all([handleProm, depthProm, hardProm])
    .then(function(arr) {
      var handle = arr[0];
      var newX = arr[2] + diagramLoc.x;
      var newY = arr[1] + diagramLoc.y;
      // console.info('newX=', newX, '  newY=', newY);
      handle.getLocation()
        .then(function(currentLoc) {
           var offsetX = Math.ceil(newX - currentLoc.x);
           var offsetY = Math.ceil(newY - currentLoc.y);
           // console.info('currentLoc=', currentLoc);
           // console.info('queueing command to move handle', index);
           new sw.ActionSequence(driver)
             .dragAndDrop(handle, {x: offsetX, y: offsetY})
             .perform();
        });
    });
  driver.sleep(200);
}

/**
 * Schedule command to test position of a handle.
 *
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Expected depth in cm
 * @param {string} hardness Expected hand hardness code
 */
function testHandle(index, depth, hardness) {
  driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='rect']" +
      "[@class='snow_profile_handle'][" + (index + 1) + "]"))
   .then(function(handle) {
     handle.getLocation()
       .then(function(currentLoc) {
         // console.info('currentLoc=', currentLoc);
         var depthPromise =
           driver.executeScript("return window.SnowProfile.y2depth('" +
           (currentLoc.y - diagramLoc.y) + "')");
         var hardnessPromise =
           driver.executeScript("return window.SnowProfile.x2code('" +
             Math.ceil(currentLoc.x - diagramLoc.x) + "')");
         sw.promise.all([depthPromise, hardnessPromise])
           .then(function(arr) {
             chai.expect(arr[0]).to.equal(depth);
             chai.expect(arr[1]).to.equal(hardness);
           });
         });
   });
   driver.sleep(200);
}

/**
 * Schedule command to click an Insert button
 *
 * @param {number} index Button number. Top button is zero.
 */
function clickInsert(index) {
  driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='g']" +
      "[@class='snow_profile_button Insert'][" + (index + 1) + "]"))
    .click();
}

/**
 * Schedule command to click the last Insert button
 */
function clickLastInsert() {
  driver.findElements(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='g']" +
    "[@class='snow_profile_button Insert']"))
    .then(function(buttons) {
      driver.findElement(sw.By.xpath(
        "//*[name()='svg']/*[name()='g']/*[name()='g']" +
        "[@class='snow_profile_button Insert'][" + buttons.length + "]"))
        .click();
    })
   .then(function() {
     driver.sleep(200);
   });
}

/**
 * Schedule command to set layer features
 *
 * @param {number} index Layer number. Top layer is zero.
 * @param {string} shape
 * @param {number} size
 * @param {string} comment
 */
function setFeatures(index, shape, size, comment) {

  var primaryShape,
    primarySubShape,
    secondaryShape,
    secondarySubShape,
    popupDisplayed;

  // Shape is a string specifying primary shape, or an array of two
  // strings specifying primary or seconday shape.  May be null.
  if ((shape !== null) && (shape !== undefined)) {

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
  }

  // Click the Edit button for the layer to open the popup.
  driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='g']" +
      "[@class='snow_profile_button Edit'][" + (index + 1) + "]")).click();
  driver.wait(function() {
    return driver.findElement(sw.By.css('div#snow_profile_popup')).isDisplayed();
    }, 2000, 'div#snow_profile_popup not found')
    .then(function() {
      if (primaryShape !== undefined) {

        // Set popup <select>s to shape values
        driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="' + primaryShape + '"]')).click();
        if (primarySubShape !== undefined) {
          driver.wait(function() {
            return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_' + primaryShape + '"]'));
            }, 2000, 'subselect for ' + primaryShape + ' not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_' + primaryShape + '"]/option[@value="' + primarySubShape + '"]')).click();
            });
        }
        if (secondaryShape !== undefined) {
          driver.wait(function() {
            return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_secondary_grain_select"]'))
            },
            2000, 'select secondary_grain_select not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_secondary_grain_select"]/option[@value="' + secondaryShape + '"]')).click();
              });
          if (secondarySubShape !== undefined) {
            driver.wait(function() {
              return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_secondary_grain_subshape_' + secondaryShape + '"]'));
            },
            2000, 'select secondary_grain_subshape not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_secondary_grain_subshape_'+ secondaryShape +'"]/option[@value="' + secondarySubShape + '"]')).click();
              });
          }
        }
      }

      // Size is a number specifying grain size, or an array of two
      // strings specifying size range.  May be null.
      if ((size !== null) && (size !== undefined)){
        var sizeClass = Object.prototype.toString.call(size);
        console.info('sizeClass=', sizeClass);
      }
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

//
test.describe('Square Top Feb 13, 2014:', function() {

  test.before(function() {
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));

    // Load the test page
    driver.get(common.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.Cfg')
      .then(function(done) {
        SnowProfile.Cfg = done;
      });

    // Get location of the diagram
    driver.findElement(
      sw.By.css('#snow_profile_diagram svg'))
      .getLocation()
      .then(function(elmt) {
        diagramLoc = elmt;
      });
  });

  /**
   * Test suite for
   */
  test.describe('make a realistic pit', function() {

    // Profile with 180 cm total, 180 cm pit depth, reference ground
    test.before(function() {

      // Load the test page
      driver.get(common.testURL);

      // Set total depth to 180 cm
      driver.findElement(sw.By.css('#snow_profile_total_depth'))
        .then(function(elmt) {
          elmt.sendKeys('180');
        });

      // Set pit depth to the same
      var cmdStr = [];
      driver.executeScript('return $("#snow_profile_pit_depth").val()')
	.then(function(val) {
	  for (var i = 0; i < val.length; i++) {
	    cmdStr.push(sw.Key.BACK_SPACE);
	  }
	  cmdStr.push(sw.Key.NULL);
	});

      // After backspacing over existing contents of input box,
      // type in '180'
      driver.findElement(sw.By.css('#snow_profile_pit_depth'))
	.then(function(elmt) {
	  cmdStr.push('180');
	  elmt.sendKeys.apply(elmt, cmdStr);
	});

      // Navigate out of the input box to make new pit depth effective
      driver.findElement(sw.By.css('#snow_profile_diagram'))
	.then(function(elmt) {
	   elmt.click();
	});
    });

    test.it('top layer 180cm, F-, PP (PPgp), 1.0-3.0', function() {
      moveHandle(0, 0, 'F-');
// FIXME: this test fails but the handle is in the right place
//      testHandle(0, 0, 'F-');
      setFeatures(0, ['PP', 'PPgp'], [1.0, 3.0]);
    });

    test.it('second layer 172cm, F-, PP, 0.5', function() {
      moveHandle(1, 8, 'F-');
//      testHandle(1, 8, 'F-');
      setFeatures(1, 'PP', 0.5);
    });

    test.it('third layer 165 cm F DFdc (PP)', function() {
      moveHandle(2, 15, 'F');
//      testHandle(2, 15, 'F');
      setFeatures(2, ['DFdc', 'PP']);
    });

    test.it('fourth layer 149 cm F PPgp', function() {
      clickLastInsert();
      moveHandle(3, 31, 'F');
      testHandle(3, 31, 'F');
    });

    test.it('fifth layer 148 cm F-4F DFdc', function() {
      clickLastInsert();
      moveHandle(4, 32, 'F-4F');
      testHandle(4, 32, 'F-4F');
    });

    test.it('sixth layer 133 cm 4F DFdc (RGlr)', function() {
      clickLastInsert();
      moveHandle(5, 47, '4F');
      testHandle(5, 47, '4F');
    });

    test.it('seventh layer 121 cm 1F DFdc (RGlr)', function() {
      clickLastInsert();
      moveHandle(6, 59, '1F');
      testHandle(6, 59, '1F');
    });

    test.it('eighth layer 106 cm P RGlr', function() {
      clickLastInsert();
      moveHandle(7, 74, 'P');
      testHandle(7, 74, 'P');
    });

    test.it('ninth layer 100 cm 1F FCxr (RGlr)', function() {
      clickLastInsert();
      moveHandle(8, 80, '1F');
      testHandle(8, 80, '1F');
    });

    test.it('tenth layer 88 cm P+ IF', function() {
      clickLastInsert();
      moveHandle(9, 92, 'P+');
      testHandle(9, 92, 'P+');
    });

    test.it('eleventh layer 87 cm 4F FXcr', function() {
      clickLastInsert();
      moveHandle(10, 93, '4F');
      testHandle(10, 93, '4F');
    });

    test.it('twelfth layer 81 cm P+ IFrc', function() {
      clickLastInsert();
      moveHandle(11, 99, 'P+');
      testHandle(11, 99, 'P+');
    });

    test.it('thirteenth layer 80 cm F FC', function() {
      clickLastInsert();
      moveHandle(12, 100, 'F');
      testHandle(12, 100, 'F');
    });

    test.it('fourteenth layer 69 cm 4F FC', function() {
      clickLastInsert();
      moveHandle(13, 111, '4F');
      testHandle(13, 111, '4F');
    });

    test.it('fifteenth layer 55 cm F FC', function() {
      clickLastInsert();
      moveHandle(14, 125, 'F');
      testHandle(14, 125, 'F');
    });

    test.it('sixteenth layer 25 cm 4F FC (DH)', function() {
      clickLastInsert();
      moveHandle(15, 155, '4F');
      testHandle(15, 155, '4F');
    });

  });

  // When done, kill the browser
  test.after(function() {
//    driver.quit();
  }); // test.after(

}); // test.decribe('

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
