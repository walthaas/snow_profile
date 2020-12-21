/**
 * @file Jest test for real pit on Square Top Feb 13, 2014
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

"use strict";

/* global expect, beforeAll, beforeEach, afterAll, afterEach */

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

describe('Square Top Feb 13, 2014:', function() {

  beforeAll(async () => {

    // Load the test page
    await com.loadPage();
    await com.setSnowDepth(180);
    await com.setPitDepth(180);
  });

    // When done, kill the browser
    afterAll( async() => {
      //    await driver.quit();
    }); // afterAll(

  /**
   * Test suite for
   */
  describe('make a realistic pit', function() {

    test('top layer 180cm, F-, PP (PPgp), 1.0-3.0', async () => {
      await moveHandle(0, 180 - 180, 'F-');
      await testHandle(0, 180 - 180, 'F-');
      await setFeatures(0, ['PP', 'PPgp'], [1.0, 3.0]);
    });

    test('second layer 172cm, F-, PP, 0.5', async () => {
      await moveHandle(1, 180 - 172, 'F-');
      await testHandle(1, 180 - 172, 'F-');
      await setFeatures(1, 'PP', 0.5);
    });

    test('third layer 165 cm F DFdc (PP), 0.5 - 1.0', async () => {
      await moveHandle(2, 180 - 165, 'F');
      await testHandle(2, 180 - 165, 'F');
      await setFeatures(2, ['DFdc', 'PP'], [0.5, 1.0]);
    });

    test('fourth layer 149 cm F PPgp, 2.0 - 4.0', async () => {
      await clickLastInsert();
      await moveHandle(3, 180 - 149, 'F');
      await testHandle(3, 180 - 149, 'F');
      await setFeatures(3, 'PPgp', [2.0, 4.0]);
    });

    test('fifth layer 148 cm F-4F DFdc, 0.3 - 0.5', async () => {
      await clickLastInsert();
      await moveHandle(4, 180 - 148, 'F-4F');
      await testHandle(4, 180 - 148, 'F-4F');
      await setFeatures(4, 'DFdc', [0.3, 0.5]);
    });

    test('sixth layer 133 cm 4F DFdc (RGlr), 0.3 - 0.5', async () => {
      await clickLastInsert();
      await moveHandle(5, 180 - 133, '4F');
      await testHandle(5, 180 - 133, '4F');
      await setFeatures(5, ['DFdc', 'RGlr'], [0.3, 0.5]);
    });

    test('seventh layer 121 cm 1F DFdc (RGlr)', async () => {
      await clickLastInsert();
      await moveHandle(6, 180 - 121, '1F');
      await testHandle(6, 180 - 121, '1F');
      await setFeatures(6, ['DFdc', 'RGlr']);
    });

    test('eighth layer 106 cm P RGlr, 0.3', async () => {
      await clickLastInsert();
      await moveHandle(7, 180 - 106, 'P');
      await testHandle(7, 180 - 106, 'P');
      await setFeatures(7, 'RGlr', 0.3);
    });

    test('ninth layer 100 cm 1F FCxr (RGlr), 0.5 - 1.0', async () => {
      await clickLastInsert();
      await moveHandle(8, 180 - 100, '1F');
      await testHandle(8, 180 - 100, '1F');
      await setFeatures(8, ['FCxr', 'RGlr'], [0.5, 1.0]);
    });

    test('tenth layer 88 cm P+ IF', async () => {
      await clickLastInsert();
      await moveHandle(9, 180 - 88, 'P+');
      await testHandle(9, 180 - 88, 'P+');
      await setFeatures(9, 'IF');
    });

    test('eleventh layer 87 cm 4F FCxr, 0.5 - 1.0', async () => {
      await clickLastInsert();
      await moveHandle(10, 180 - 87, '4F');
      await testHandle(10, 180 - 87, '4F');
      await setFeatures(10, 'FCxr', [0.5, 1.0],
        "ECTP30 Q1 Depth: (cm) 81");
    });

    test('twelfth layer 81 cm P+ IFrc', async () => {
      await clickLastInsert();
      await moveHandle(11, 180 - 81, 'P+');
      await testHandle(11, 180 - 81, 'P+');
      await setFeatures(11, 'IFrc');
    });

    test('thirteenth layer 80 cm F FC, 1.0 - 2.0', async () => {
      await clickLastInsert();
      await moveHandle(12, 180 - 80, 'F');
      await testHandle(12, 180 - 80, 'F');
      await setFeatures(12, 'FC', [1.0, 2.0]);
    });

    test('fourteenth layer 69 cm 4F FC, 1.0 - 3.0', async () => {
      await clickLastInsert();
      await moveHandle(13, 180 - 69, '4F');
      await testHandle(13, 180 - 69, '4F');
      await setFeatures(13, 'FC', [1.0, 3.0],
        "ECTP30 Q1 Depth: (cm) 55");
    });

    test('fifteenth layer 55 cm F FC, 2.0 - 3.0', async () => {
      await clickLastInsert();
      await moveHandle(14, 180 - 55, 'F');
      await testHandle(14, 180 - 55, 'F');
      await setFeatures(14, 'FC', [2.0, 3.0],
        "CTM Q1 Depth (cm) 55 CT score: 15");
    });

    test('sixteenth layer 25 cm 4F FC (DH), 2.0 - 3.0', async () => {
      await clickLastInsert();
      await moveHandle(15, 180 - 25, '4F');
      await testHandle(15, 180 - 25, '4F');
      await setFeatures(15, ['FC', 'DH'], [2.0, 3.0]);
    });

  });

}); // decribe('

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
