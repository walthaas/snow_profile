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
  var handleProm = driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='rect']" +
      "[@class='snow_profile_handle'][" + (index + 1) + "]"));

  var depthProm = driver.executeScript("return window.SnowProfile.depth2y('" +
    depth + "')");

  var hardProm = driver.executeScript("return window.SnowProfile.code2x('" +
    hardness + "')");

  sw.promise.all([handleProm, depthProm, hardProm])
    .then(function(arr) {
      var handle = arr[0];
      var newX = arr[2] + diagramLoc.x;
      var newY = arr[1] + diagramLoc.y;
      console.info('newX=', newX, '  newY=', newY);
      handle.getLocation()
        .then(function(currentLoc) {
           var offsetX = Math.ceil(newX - currentLoc.x);
           var offsetY = Math.ceil(newY - currentLoc.y);
           new sw.ActionSequence(driver)
             .dragAndDrop(handle, {x: offsetX, y: offsetY})
             .perform();
         });
       });
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
         console.info('currentLoc=', currentLoc);
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
   .then(function(button) {
     button.click();
   });
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
        .then(function(button){
          button.click();
        });
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

    test.it('top layer 180cm F- PP (PPgp)', function() {
      moveHandle(0, 0, 'F-');
      testHandle(0, 0, 'F-');
    });

    test.it('second layer 172 cm F- PP', function() {
      moveHandle(1, 8, 'F-');
      testHandle(1, 8, 'F-');
    });

    test.it('third layer 165 cm F DFdc (PP)', function() {
      moveHandle(2, 15, 'F');
      testHandle(2, 15, 'F');
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
