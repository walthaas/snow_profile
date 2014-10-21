/**
 * @file Mocha tests for the handles
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

// Test the handles
test.describe('Handles:', function() {

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

  });  // test.before(

  /**
   * Test suite for initial conditions of a fresh page
   */
  test.describe('handles starting conditions', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    test.it('page should have 3 handles', function() {
      chai.expect('rect.snow_profile_handle').dom.to.have.count(3);
    });

    // All handles should start out at HANDLE_INIT_X
    test.it('handles should start at HANDLE_INIT_X', function() {
      driver.findElements(
        sw.By.css('rect.snow_profile_handle'))
        .then(function(done) {
          done.forEach(function(promise) {
            promise.getLocation().then(function(done) {
              chai.expect(done.x).to.equal(SnowProfile.Cfg.HANDLE_INIT_X +
                diagramLoc.x);
            });
          });
        });
      });

  });

  /**
   * Test handle drag and drop operation
   */
  test.describe('drag and drop handles', function() {

    test.before(function() {
      // Load the test page
      driver.get(common.testURL);
    });

    // Move handles around, test where they end up
    test.it('dragNdrop top handle to hardness 4F', function() {
      moveHandle(0, 0, '4F');
      testHandle(0, 0, '4F');
    });
    test.it('dragNdrop second handle to depth 10, hardness 1F', function() {
      moveHandle(1, 10, '1F');
      testHandle(1, 10, '1F');
    });
    test.it('dragNdrop third handle to depth 20, hardness P', function() {
      moveHandle(2, 20, 'P');
      testHandle(2, 20, 'P');
    });
    test.it('dragNdrop second handle to depth 30, hardness 1F', function() {
      moveHandle(1, 30, '1F');
      testHandle(1, 19.8, '1F');
    });
    test.it('dragNdrop second handle to depth 0, hardness 1F', function() {
      moveHandle(1, 0, '1F');
      testHandle(1, 0, '1F');
    });
    test.it('dragNdrop second handle to depth 10, hardness F-', function() {
      moveHandle(1, 10, 'F-');
      testHandle(1, 10, 'F-');
    });
    test.it('dragNdrop second handle to depth 10, hardness I', function() {
      moveHandle(1, 10, 'I');
      testHandle(1, 10, 'I');
    });
    test.it('create a fourth layer at depth 40', function() {
      clickLastInsert();
      moveHandle(3, 40, 'K');
      testHandle(3, 40, 'K');
    });
  }); // test.describe('drag and drop handles',

  // When done, kill the browser
  test.after(function() {
    driver.quit();
  }); // test.after(

}); // test.decribe('Snow Profile diagram handles'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
