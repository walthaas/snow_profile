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

// Test the handles
test.describe('Snow Profile diagram handles', function() {
//  console.info('executing outermost describe');

  test.before(function() {
//    console.info('executing outermost describe.before');
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));

    // Load the test page
    driver.get(common.testURL);
//console.info('driver.get qd');
    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.Cfg')
      .then(function(done) {
        SnowProfile.Cfg = done;
      });
//console.info('driver.executeScript qd');
   driver.findElement(sw.By.css('#snow_profile_diagram svg'))
     .getLocation()
     .then(function(done) {
       diagramLoc = done;
     });
//console.info('driver.findElement qd');
  });  // test.before(
//console.info('before qd');

  test.describe('starting conditions', function() {
//console.info('executing 1st inner describe');

    test.before(function() {
//console.info('executing first inner describe.before');
    });
//console.info('first inner describe.before qd');

    test.it('page should have one <svg> element', function() {
//console.info('executing test 1');
      chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
    });
//console.info('test 1 qd');

    test.it('page should have 3 handles', function() {
//console.info('executing test 2');
      chai.expect('rect.snow_profile_handle').dom.to.have.count(3);
    });
//console.info('test 2 qd');

    // All handles should start out at HANDLE_INIT_X
    test.it('handles should start at HANDLE_INIT_X', function() {
//console.info('executing test 3');
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
//console.info('test 3 qd');

    test.after(function(){
//console.info('executing first inner describe.after');
    });
//console.info('first inner describe.after qd');
  });

  test.describe('drag and drop handles', function() {
//console.info('executing 2nd inner describe');

    test.before(function() {
//  console.info('executing 2nd inner describe.before');
    // Move a random handle to the right
//    console.info('driver defined? %b', driver);
    driver.findElement(sw.By.css('rect.snow_profile_handle'))
      .then(function(handle) {
      new sw.ActionSequence(driver)
        .mouseDown(handle)
        .mouseMove({x:30})
        .mouseUp()
        .perform();
      });
    });
//  console.info('2nd inner describe.before qd');
    // Move a random handle to the right
    // console.info('driver defined? %b', driver);
    // driver.findElement(sw.By.css('rect.snow_profile_handle'))
    //   .then(function(handle) {
    //   new sw.ActionSequence(driver)
    //     .mouseDown(handle)
    //     .mouseMove({x:30})
    //     .mouseUp()
    //     .perform();
    //   });
    test.after(function() {
//  console.info('executing 2nd inner describe.after');
    });
//  console.info('2nd inner describe.after qd');
  });

  // When done, kill the browser
  test.after(function() {
//    console.info('executing outermost describe.after');
    driver.quit();
  }); // test.after(
//console.info('after qd');

}); // test.decribe('Snow Profile diagram handles'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
