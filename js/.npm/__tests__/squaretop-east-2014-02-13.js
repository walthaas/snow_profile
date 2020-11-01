/**
 * @file Mocha test for real pit on Square Top Feb 13, 2014
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

"use strict";

let com = require('./lib/common.js');
let Builder = com.Builder;
let By = com.By;
let Key = com.Key;
let until = com.until;
let driver = com.driver;
let moveHandle = com.moveHandle;
let testHandle = com.testHandle;
let setFeatures = com.setFeatures;
let clickLastInsert = com.clickLastInsert;

/**
 * Schedule command to click an Insert button
 *
 * @param {number} index Button number. Top button is zero.
 */
function clickInsert(index) {
  // @todo convert
  // driver.findElement(sw.By.xpath(
  //   com.buttonsXpath +
  //     "[@class='snow_profile_button_insert'][" + (index + 1) + "]"))
  //   .click();
}

//
describe('Square Top Feb 13, 2014:', function() {

  beforeAll(async () => {

    // Load the test page
    await driver.get(com.testURL);
  });

  /**
   * Test suite for
   */
  describe('make a realistic pit', function() {

    // Profile with 180 cm total, 180 cm pit depth, reference ground
    beforeEach(function() {
      // @todo convert
      // // Load the test page
      // driver.get(com.testURL);

      // // Set total depth to 180 cm
      // driver.findElement(sw.By.css('#snow_profile_total_depth'))
      //   .then(function(elmt) {
      //     elmt.sendKeys('180');
      //   });

      // // Set pit depth to the same
      // var cmdStr = [];
      // driver.executeScript('return $("#snow_profile_pit_depth").val()')
      //   .then(function(val) {
      //     for (var i = 0; i < val.length; i++) {
      //       cmdStr.push(sw.Key.BACK_SPACE);
      //     }
      //     cmdStr.push(sw.Key.NULL);
      //   });

      // // After backspacing over existing contents of input box,
      // // type in '180'
      // driver.findElement(sw.By.css('#snow_profile_pit_depth'))
      //   .then(function(elmt) {
      //     cmdStr.push('180');
      //     elmt.sendKeys.apply(elmt, cmdStr);
      //   });

      // // Navigate out of the input box to make new pit depth effective
      // driver.findElement(sw.By.css('#snow_profile_diagram'))
      //   .then(function(elmt) {
      //      elmt.click();
      //   });
    });

    test('top layer 180cm, F-, PP (PPgp), 1.0-3.0', function() {
      await moveHandle(0, 180 - 180, 'F-');
      testHandle(0, 180 - 180, 'F-');
      setFeatures(0, ['PP', 'PPgp'], [1.0, 3.0]);
    });

    test('second layer 172cm, F-, PP, 0.5', function() {
      await moveHandle(1, 180 - 172, 'F-');
      testHandle(1, 180 - 172, 'F-');
      setFeatures(1, 'PP', 0.5);
    });

    test('third layer 165 cm F DFdc (PP), 0.5 - 1.0', function() {
      await moveHandle(2, 180 - 165, 'F');
      testHandle(2, 180 - 165, 'F');
      setFeatures(2, ['DFdc', 'PP'], [0.5, 1.0]);
    });

    test('fourth layer 149 cm F PPgp, 2.0 - 4.0', function() {
      clickLastInsert();
      await moveHandle(3, 180 - 149, 'F');
      testHandle(3, 180 - 149, 'F');
      setFeatures(3, 'PPgp', [2.0, 4.0]);
    });

    test('fifth layer 148 cm F-4F DFdc, 0.3 - 0.5', function() {
      clickLastInsert();
      await moveHandle(4, 180 - 148, 'F-4F');
      testHandle(4, 180 - 148, 'F-4F');
      setFeatures(4, 'DFdc', [0.3, 0.5]);
    });

    test('sixth layer 133 cm 4F DFdc (RGlr), 0.3 - 0.5', function() {
      clickLastInsert();
      await moveHandle(5, 180 - 133, '4F');
      testHandle(5, 180 - 133, '4F');
      setFeatures(5, ['DFdc', 'RGlr'], [0.3, 0.5]);
    });

    test('seventh layer 121 cm 1F DFdc (RGlr)', function() {
      clickLastInsert();
      await moveHandle(6, 180 - 121, '1F');
      testHandle(6, 180 - 121, '1F');
      setFeatures(6, ['DFdc', 'RGlr']);
    });

    test('eighth layer 106 cm P RGlr, 0.3', function() {
      clickLastInsert();
      await moveHandle(7, 180 - 106, 'P');
      testHandle(7, 180 - 106, 'P');
      setFeatures(7, 'RGlr', 0.3);
    });

    test('ninth layer 100 cm 1F FCxr (RGlr), 0.5 - 1.0', function() {
      clickLastInsert();
      await moveHandle(8, 180 - 100, '1F');
      testHandle(8, 180 - 100, '1F');
      setFeatures(8, ['FCxr', 'RGlr'], [0.5, 1.0]);
    });

    test('tenth layer 88 cm P+ IF', function() {
      clickLastInsert();
      await moveHandle(9, 180 - 88, 'P+');
      testHandle(9, 180 - 88, 'P+');
      setFeatures(9, 'IF');
    });

    test('eleventh layer 87 cm 4F FCxr, 0.5 - 1.0', function() {
      clickLastInsert();
      await moveHandle(10, 180 - 87, '4F');
      testHandle(10, 180 - 87, '4F');
      setFeatures(10, 'FCxr', [0.5, 1.0],
        "ECTP30 Q1 Depth: (cm) 81");
    });

    test('twelfth layer 81 cm P+ IFrc', function() {
      clickLastInsert();
      await moveHandle(11, 180 - 81, 'P+');
      testHandle(11, 180 - 81, 'P+');
      setFeatures(11, 'IFrc');
    });

    test('thirteenth layer 80 cm F FC, 1.0 - 2.0', function() {
      clickLastInsert();
      await moveHandle(12, 180 - 80, 'F');
      testHandle(12, 180 - 80, 'F');
      setFeatures(12, 'FC', [1.0, 2.0]);
    });

    test('fourteenth layer 69 cm 4F FC, 1.0 - 3.0', function() {
      clickLastInsert();
      await moveHandle(13, 180 - 69, '4F');
      testHandle(13, 180 - 69, '4F');
      setFeatures(13, 'FC', [1.0, 3.0],
        "ECTP30 Q1 Depth: (cm) 55");
    });

    test('fifteenth layer 55 cm F FC, 2.0 - 3.0', function() {
      clickLastInsert();
      await moveHandle(14, 180 - 55, 'F');
      testHandle(14, 180 - 55, 'F');
      setFeatures(14, 'FC', [2.0, 3.0],
        "CTM Q1 Depth (cm) 55 CT score: 15");
    });

    test('sixteenth layer 25 cm 4F FC (DH), 2.0 - 3.0', function() {
      clickLastInsert();
      await moveHandle(15, 180 - 25, '4F');
      testHandle(15, 180 - 25, '4F');
      setFeatures(15, ['FC', 'DH'], [2.0, 3.0]);
    });

  });

  // When done, kill the browser
  afterAll( async() => {
    await driver.quit();
  }); // afterAll(

}); // decribe('

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
