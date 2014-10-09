/**
 * @file Mocha tests for the reference grid
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  common = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');

// Test the reference grid
test.describe('Reference grid:', function() {

  // Store info read from the page being tested
  var hardnessLabels = [],
    depthLabels = [],
    expectLabels = [],
    driver,
    SnowProfile = {};

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
  });  // test.before(

  test.it('page should have one <svg> element', function() {
    chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
  });

  test.it('page should have a reference depth selector', function() {
    chai.expect('#snow_profile_ref_depth').dom.to.have.count(1);
  });

  test.it('the reference depth selector should not be shown', function() {
    chai.expect('#snow_profile_ref_depth')
      .dom.to.have.style('display', 'none');
  });

  test.it('Hardness scale labels should exist', function() {
    // Read the hardness scale text elements into hardnessLabels[]
    driver.findElements(
      sw.By.css('#snow_profile_diagram svg text.snow_profile_hardness'))
      .then(function(done) {
        done.forEach(function(promise) {
          promise.getText().then(function(done) {
            hardnessLabels.push(done);
          });
        });
      })
      .then(function() {
        // Check for the expected text values
        chai.expect(hardnessLabels.length).to.equal(7);
        expectLabels = ['Hand Hardness', 'F', '4F', '1F', 'P', 'K', 'I'].sort();
        hardnessLabels.sort();
        expectLabels.forEach(function(v, i) {
          chai.expect(hardnessLabels[i]).to.equal(v);
        });
      });
  });

  test.it('Depth reference should default to surface', function() {
    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.depthRef')
      .then(function(done) {
        chai.expect(done).to.equal('s');
      });
  });

  // Check the depth labels at default pit depth
  test.it('Depth labels should match default', function() {
    //Read the depth scale text elements into depthLabels[]
    depthLabels = [];
    driver.findElements(
      sw.By.css('#snow_profile_diagram svg text.snow_profile_depth'))
      .then(function(done) {
        done.forEach(function(promise) {
          promise.getText().then(function(done) {
            depthLabels.push(done);
          });
        });
      })
      .then(function() {
        expectLabels = ['Depth (cm)'];
        for (var d = 0; d <= SnowProfile.Cfg.DEFAULT_PIT_DEPTH;
          d += SnowProfile.Cfg.DEPTH_LINE_INT) {
          expectLabels.push(String(d));
        }
        depthLabels.sort();
        expectLabels.sort();
        chai.expect(depthLabels.length).to.equal(expectLabels.length);
        // Depth increment labels should match default from '0'
        // to DEFAULT_PIT_DEPTH by increments of DEPTH_LINE_INT
        expectLabels.forEach(function(v, i) {
          chai.expect(depthLabels[i]).to.equal(v);
        });
      });
  });

  // Check the depth labels at minimum pit depth
  test.it('Depth labels should adjust for minimum pit depth', function() {
    // First get the current contents of the "Snow pit depth" input
    // box, so we will know what we need to backspace over
    depthLabels = [];
    var cmdStr = [];
    driver.executeScript('return $("#snow_profile_pit_depth").val()')
      .then(function(val) {
        for (var i = 0; i < val.length; i++) {
          cmdStr.push(sw.Key.BACK_SPACE);
        }
        cmdStr.push(sw.Key.NULL);
      });
    // After backspacing over existing contents of input box,
    // type in the minimum pit depth
    driver.findElement(sw.By.css('#snow_profile_pit_depth'))
      .then(function(elmt) {
        cmdStr.push(String(SnowProfile.Cfg.MIN_DEPTH));
        elmt.sendKeys.apply(elmt, cmdStr);
      });
    // Navigate out of the input box to make new pit depth effective
    driver.findElement(sw.By.css('#snow_profile_diagram'))
      .then(function(elmt) {
         elmt.click();
      });
    // Read the depth scale text elements into depthLabels[]
    driver.findElements(sw.By.css(
      '#snow_profile_diagram svg text.snow_profile_depth'))
      .then(function(done) {
        done.forEach(function(promise) {
          promise.getText()
            .then(function(done) {
              depthLabels.push(done);
            });
          });
        })
      .then(function() {
        expectLabels = ['Depth (cm)'];
        for (var d = 0; d <= SnowProfile.Cfg.MIN_DEPTH;
          d += SnowProfile.Cfg.DEPTH_LINE_INT) {
          expectLabels.push(String(d));
        }
        depthLabels.sort();
        expectLabels.sort();
        chai.expect(depthLabels.length).to.equal(expectLabels.length);
        // Depth increment labels should match default from '0'
        // to MIN_DEPTH by increments of DEPTH_LINE_INT
        expectLabels.forEach(function(v, i) {
          chai.expect(depthLabels[i]).to.equal(v);
        });
      });
    });

  // Check the depth labels at maximum pit depth
  test.it('Depth labels should adjust for maximum pit depth', function() {
    // First get the current contents of the "Snow pit depth" input
    // box, so we will know what we need to backspace over
    depthLabels = [];
    var cmdStr = [];
    driver.executeScript('return $("#snow_profile_pit_depth").val()')
      .then(function(val) {
        for (var i = 0; i < val.length; i++) {
          cmdStr.push(sw.Key.BACK_SPACE);
        }
        cmdStr.push(sw.Key.NULL);
      });
    // After backspacing over existing contents of input box,
    // type in the minimum pit depth
    driver.findElement(sw.By.css('#snow_profile_pit_depth'))
      .then(function(elmt) {
        cmdStr.push(String(SnowProfile.Cfg.MAX_DEPTH));
        elmt.sendKeys.apply(elmt, cmdStr);
      });
    // Navigate out of the input box to make new pit depth effective
    driver.findElement(sw.By.css('#snow_profile_diagram'))
      .then(function(elmt) {
         elmt.click();
      });
    // Read the depth scale text elements into depthLabels[]
    driver.findElements(sw.By.css(
      '#snow_profile_diagram svg text.snow_profile_depth'))
      .then(function(done) {
        done.forEach(function(promise) {
          promise.getText()
            .then(function(done) {
              depthLabels.push(done);
            });
          });
        })
      .then(function() {
        expectLabels = ['Depth (cm)'];
        for (var d = 0; d <= SnowProfile.Cfg.MAX_DEPTH;
          d += SnowProfile.Cfg.DEPTH_LINE_INT) {
          expectLabels.push(String(d));
        }
        depthLabels.sort();
        expectLabels.sort();
        chai.expect(depthLabels.length).to.equal(expectLabels.length);
        // Depth increment labels should match default from '0'
        // to MAX_DEPTH by increments of DEPTH_LINE_INT
        expectLabels.forEach(function(v, i) {
          chai.expect(depthLabels[i]).to.equal(v);
        });
      });
    });

  test.it('Setting total depth changes reference, pit depth', function() {
    // Set total depth 200
    driver.findElement(sw.By.css('#snow_profile_total_depth'))
      .then(function(elmt) {
        elmt.sendKeys("200");
      });
    // Navigate out of the input box to make new pit depth effective
    driver.findElement(sw.By.css('#snow_profile_diagram'))
      .then(function(elmt) {
         elmt.click();
      })
      .then(function() {
        // Verify that reference select is now visible
        chai.expect('#snow_profile_ref_depth')
          .dom.to.have.style('display', 'inline');
      });
    driver.executeScript('return $("#snow_profile_pit_depth").val()')
      .then(function(val) {
        // Verify that pit depth changed to 200
        chai.expect(val).to.equal("200");
      });
    driver.executeScript('return window.SnowProfile.depthRef')
      .then(function(done) {
        // Verify that reference changed to 'g'
        chai.expect(done).to.equal('g');
      });
  });

  test.it('Setting pit depth changes labels', function() {
    // Set pit depth 100, then verify depth labels
    depthLabels = [];
    var cmdStr = [];
    driver.executeScript('return $("#snow_profile_pit_depth").val()')
      .then(function(val) {
        for (var i = 0; i < val.length; i++) {
          cmdStr.push(sw.Key.BACK_SPACE);
        }
        cmdStr.push(sw.Key.NULL);
      });
    // After backspacing over existing contents of input box,
    // type in "100"
    driver.findElement(sw.By.css('#snow_profile_pit_depth'))
      .then(function(elmt) {
        cmdStr.push("100");
        elmt.sendKeys.apply(elmt, cmdStr);
      });
    // Navigate out of the input box to make new pit depth effective
    driver.findElement(sw.By.css('#snow_profile_diagram'))
      .then(function(elmt) {
         elmt.click();
      });
    // Read the depth scale text elements into depthLabels[]
    driver.findElements(sw.By.css(
      '#snow_profile_diagram svg text.snow_profile_depth'))
      .then(function(done) {
        done.forEach(function(promise) {
          promise.getText()
            .then(function(done) {
              depthLabels.push(done);
            });
          });
        })
      .then(function() {
        expectLabels = ['Depth (cm)'];
        for (var d = 100; d <= 200; d += SnowProfile.Cfg.DEPTH_LINE_INT) {
          expectLabels.push(String(d));
        }
        depthLabels.sort();
        expectLabels.sort();
        chai.expect(depthLabels.length).to.equal(expectLabels.length);
        // Depth increment labels should match default from '100'
        // to '200' by increments of DEPTH_LINE_INT
        expectLabels.forEach(function(v, i) {
          chai.expect(depthLabels[i]).to.equal(v);
        });
      });
    // Change reference to 's'
    driver.findElement(sw.By.xpath(
      '//select[@id="snow_profile_ref_select"]/option[@value="s"]'))
      .then(function(elmt) {
        elmt.click();
      });
    // Verify depth labels
    driver.findElements(sw.By.css(
      '#snow_profile_diagram svg text.snow_profile_depth'))
      .then(function(done) {
        depthLabels = [];
        done.forEach(function(promise) {
          promise.getText()
            .then(function(done) {
              depthLabels.push(done);
            });
          });
        })
      .then(function() {
        expectLabels = ['Depth (cm)'];
        for (var d = 0; d <= 100; d += SnowProfile.Cfg.DEPTH_LINE_INT) {
          expectLabels.push(String(d));
        }
        depthLabels.sort();
        expectLabels.sort();
        chai.expect(depthLabels.length).to.equal(expectLabels.length);
        // Depth increment labels should match default from '0'
        // to '100' by increments of DEPTH_LINE_INT
        expectLabels.forEach(function(v, i) {
          chai.expect(depthLabels[i]).to.equal(v);
        });
      });
  });

  // When done, kill the browser
  test.after(function() {
    driver.quit();
  });

}); // test.decribe('reference grid

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
