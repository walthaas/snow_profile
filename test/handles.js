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
    bodyLoc,
    containerLoc,
    diagramLoc,
    driver;

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

    // Move a random handle to the right
    test.it('should be able to drag and drop a handle', function() {
      driver.findElement(sw.By.css('rect.snow_profile_handle'))
        .then(function(handle) {
          new sw.ActionSequence(driver)
            .mouseDown(handle)
            .mouseMove({x:30})
            .mouseUp()
            .perform();
        });
    });
  }); // test.describe('drag and drop handles',

  // When done, kill the browser
  test.after(function() {
//    driver.quit();
  }); // test.after(

}); // test.decribe('Snow Profile diagram handles'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
