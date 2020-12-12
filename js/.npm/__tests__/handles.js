/**
 * @file Jest tests for the handles
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
let loadPage = com.loadPage

// Snow profile configuration read from web page
let SnowProfile = {};

// Location of the diagram on the page
let diagramLoc = {};

// Test the handles
describe('Handles:', function() {

    beforeAll( async() => {

      // Load the test page
      await loadPage();
      SnowProfile = com.SnowProfile;

      // Get location of the diagram
      let elmt = await driver.findElement(By.css('#snow_profile_diagram svg'));
      diagramLoc = await elmt.getRect();

    });

    // When done, kill the browser
    afterAll (async () => {
      await driver.quit();
    });

  /**
   * Test suite for initial conditions of a fresh page
   */
  describe('handles initial conditions', function() {

    test('page should have handles', async () => {
      let handles = await driver.findElements(
        By.className('snow_profile_handle'));
      expect(handles.length).toBe(SnowProfile.Cfg.NUM_INIT_LAYERS);
    });

    // All handles should start out at HANDLE_INIT_X
    test('handles should start at HANDLE_INIT_X', async () => {
      let handles = await driver.findElements(
        By.className('snow_profile_handle'));
      for (let i in handles) {
        if ({}.hasOwnProperty.call(handles, i)) {
          let handleLoc = parseFloat(await handles[i].getAttribute('x'));
          expect(handleLoc).toBe(
            SnowProfile.Cfg.HANDLE_INIT_X);
        }
      }
    });
  });

  /**
   * Test handle drag and drop operation
   */
  describe('drag and drop handles', function() {

    // Move handles around, test where they end up
    test('dragNdrop top handle to hardness 4F', async () => {
      await moveHandle(0, 0, '4F');
      await testHandle(0, 0, '4F');
    });

    test('dragNdrop second handle to depth 10, hardness 1F', async () => {
      await moveHandle(1, 10, '1F');
      await testHandle(1, 10, '1F');
    });

    test('dragNdrop third handle to depth 20, hardness P', async () => {
      await moveHandle(2, 20, 'P');
      await testHandle(2, 20, 'P');
    });

    test('dragNdrop second handle to depth 30, hardness 1F', async () => {
      await moveHandle(1, 30, '1F');
      await testHandle(1, 19.8, '1F');
    });
    test('dragNdrop second handle to depth 0, hardness 1F', async () => {
      await moveHandle(1, 0, '1F');
      await testHandle(1, 0, '1F');
    });
    test('dragNdrop second handle to depth 10, hardness F-', async () => {
      await moveHandle(1, 10, 'F-');
      await testHandle(1, 10, 'F-');
    });
    test('dragNdrop second handle to depth 10, hardness I', async () => {
      await moveHandle(1, 10, 'I');
      await testHandle(1, 10, 'I');
    });
    test('create a fourth layer at depth 40, hardness K', async () => {
      await com.clickLastInsert();
      await moveHandle(3, 40, 'K');
      await testHandle(3, 40, 'K');
    });
  }); // describe('drag and drop handles',

}); // decribe('Snow Profile diagram handles'

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
