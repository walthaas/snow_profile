/**
 * @file Mocha test for real pit on Square Top Feb 13, 2014
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  com = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver')
  var SnowProfile = {},
    driver;

/**
 * Schedule command to click an Insert button
 *
 * @param {number} index Button number. Top button is zero.
 */
function clickInsert(index) {
  driver.findElement(sw.By.xpath(
    com.buttonsXpath +
      "[@class='snow_profile_button_insert'][" + (index + 1) + "]"))
    .click();
}

//
describe('Square Top Feb 13, 2014:', function() {

  before(function() {
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));

    // Load the test page
    driver.get(com.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    driver.executeScript('return window.SnowProfile.Cfg')
      .then(function(done) {
        SnowProfile.Cfg = done;
      });
  });

  /**
   * Test suite for
   */
  describe('make a realistic pit', function() {

    // Profile with 180 cm total, 180 cm pit depth, reference ground
    before(function() {

      // Load the test page
      driver.get(com.testURL);

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

    it('top layer 180cm, F-, PP (PPgp), 1.0-3.0', function() {
      com.moveHandle(sw, driver, 0, 180 - 180, 'F-');
      com.testHandle(sw, driver, chai, 0, 180 - 180, 'F-');
      com.setFeatures(sw, driver, 0, ['PP', 'PPgp'], [1.0, 3.0]);
    });

    it('second layer 172cm, F-, PP, 0.5', function() {
      com.moveHandle(sw, driver, 1, 180 - 172, 'F-');
      com.testHandle(sw, driver, chai, 1, 180 - 172, 'F-');
      com.setFeatures(sw, driver, 1, 'PP', 0.5);
    });

    it('third layer 165 cm F DFdc (PP), 0.5 - 1.0', function() {
      com.moveHandle(sw, driver, 2, 180 - 165, 'F');
      com.testHandle(sw, driver, chai, 2, 180 - 165, 'F');
      com.setFeatures(sw, driver, 2, ['DFdc', 'PP'], [0.5, 1.0]);
    });

    it('fourth layer 149 cm F PPgp, 2.0 - 4.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 3, 180 - 149, 'F');
      com.testHandle(sw, driver, chai, 3, 180 - 149, 'F');
      com.setFeatures(sw, driver, 3, 'PPgp', [2.0, 4.0]);
    });

    it('fifth layer 148 cm F-4F DFdc, 0.3 - 0.5', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 4, 180 - 148, 'F-4F');
      com.testHandle(sw, driver, chai, 4, 180 - 148, 'F-4F');
      com.setFeatures(sw, driver, 4, 'DFdc', [0.3, 0.5]);
    });

    it('sixth layer 133 cm 4F DFdc (RGlr), 0.3 - 0.5', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 5, 180 - 133, '4F');
      com.testHandle(sw, driver, chai, 5, 180 - 133, '4F');
      com.setFeatures(sw, driver, 5, ['DFdc', 'RGlr'], [0.3, 0.5]);
    });

    it('seventh layer 121 cm 1F DFdc (RGlr)', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 6, 180 - 121, '1F');
      com.testHandle(sw, driver, chai, 6, 180 - 121, '1F');
      com.setFeatures(sw, driver, 6, ['DFdc', 'RGlr']);
    });

    it('eighth layer 106 cm P RGlr, 0.3', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 7, 180 - 106, 'P');
      com.testHandle(sw, driver, chai, 7, 180 - 106, 'P');
      com.setFeatures(sw, driver, 7, 'RGlr', 0.3);
    });

    it('ninth layer 100 cm 1F FCxr (RGlr), 0.5 - 1.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 8, 180 - 100, '1F');
      com.testHandle(sw, driver, chai, 8, 180 - 100, '1F');
      com.setFeatures(sw, driver, 8, ['FCxr', 'RGlr'], [0.5, 1.0]);
    });

    it('tenth layer 88 cm P+ IF', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 9, 180 - 88, 'P+');
      com.testHandle(sw, driver, chai, 9, 180 - 88, 'P+');
      com.setFeatures(sw, driver, 9, 'IF');
    });

    it('eleventh layer 87 cm 4F FCxr, 0.5 - 1.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 10, 180 - 87, '4F');
      com.testHandle(sw, driver, chai, 10, 180 - 87, '4F');
      com.setFeatures(sw, driver, 10, 'FCxr', [0.5, 1.0],
        "ECTP30 Q1 Depth: (cm) 81");
    });

    it('twelfth layer 81 cm P+ IFrc', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 11, 180 - 81, 'P+');
      com.testHandle(sw, driver, chai, 11, 180 - 81, 'P+');
      com.setFeatures(sw, driver, 11, 'IFrc');
    });

    it('thirteenth layer 80 cm F FC, 1.0 - 2.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 12, 180 - 80, 'F');
      com.testHandle(sw, driver, chai, 12, 180 - 80, 'F');
      com.setFeatures(sw, driver, 12, 'FC', [1.0, 2.0]);
    });

    it('fourteenth layer 69 cm 4F FC, 1.0 - 3.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 13, 180 - 69, '4F');
      com.testHandle(sw, driver, chai, 13, 180 - 69, '4F');
      com.setFeatures(sw, driver, 13, 'FC', [1.0, 3.0],
        "ECTP30 Q1 Depth: (cm) 55");
    });

    it('fifteenth layer 55 cm F FC, 2.0 - 3.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 14, 180 - 55, 'F');
      com.testHandle(sw, driver, chai, 14, 180 - 55, 'F');
      com.setFeatures(sw, driver, 14, 'FC', [2.0, 3.0],
        "CTM Q1 Depth (cm) 55 CT score: 15");
    });

    it('sixteenth layer 25 cm 4F FC (DH), 2.0 - 3.0', function() {
      com.clickLastInsert(sw, driver);
      com.moveHandle(sw, driver, 15, 180 - 25, '4F');
      com.testHandle(sw, driver, chai, 15, 180 - 25, '4F');
      com.setFeatures(sw, driver, 15, ['FC', 'DH'], [2.0, 3.0]);
    });

  });

  // When done, kill the browser
  after(function() {
//    driver.quit();
  }); // after(

}); // decribe('

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
