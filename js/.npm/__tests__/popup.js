/**
 * @file Jest tests for the popups
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
let loadPage = com.loadPage;

// Snow profile configuration read from web page
let SnowProfile;

// Test the popups
describe('Popup:', function() {

  /**
   * Initialize, load the test page and read
   * the static configuration variables from the page JS
   */
  beforeAll(async () => {

    // Load the test page
    await loadPage();
    SnowProfile = com.SnowProfile;
  });  // beforeAll(

  // When done, kill the browser
  afterAll(async () => {
    await driver.quit();
  }); // afterAll(

  /**
   * Test suite for initial conditions of a fresh page
   */
  describe('popup page initial conditions:', function() {

    test('right initial number of buttons', async () => {
      let numButtons = await driver.findElements(By.css('use'));
      expect(numButtons.length).toEqual(2 * SnowProfile.Cfg.NUM_INIT_LAYERS);
      //   });
    });

    test('popup is not displayed', async () => {
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();
    });

  });  // describe('popup page initial conditions

  /**
   * Test suite for initial conditions of popup
   */
  describe('popup initial conditions:', function() {

    test('click on edit button opens popup', async () => {
      let button = await driver.findElement(By.css(
        'use.snow_profile_button_edit:first-of-type')).click();
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.wait(until.elementIsVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeTruthy();
    });

    //  Test for valid initial state of popup
    testPopupInit();

    test('Cancel button dismisses popup', async () => {
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.findElement(By.xpath(
        '//button/span[text()="Cancel"]')).click();
      await driver.wait(until.elementIsNotVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();
    });
  });  // describe('popup initial conditions

  /**
   * Test suite for Primary Grain Shape operation of popup
   */
  describe('popup Primary Grain Shape operation:', function() {

    test('Select Primary Grain Shape PP displays PP icon', async () => {

      //  Open the edit popup
      let button = await driver.findElement(By.css(
        'use.snow_profile_button_edit:first-of-type')).click();
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.wait(until.elementIsVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeTruthy();

      //  Select Primary Grain Shape: Precipitation Particles
      await driver.findElement(By.xpath(
        '//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]')).click();

      //  Verify that Primary Subshape, Secondary Grain Shape are displayed
      let primarySubshape = await driver.findElement(By.id(
        'snow_profile_primary_grain_subshape_PP'));
      displayed = await primarySubshape.isDisplayed();
      expect(displayed).toBeTruthy();
      let secondaryShape = await driver.findElement(By.id(
        'snow_profile_secondary_grain_select'));
      displayed = await secondaryShape.isDisplayed();
      expect(displayed).toBeTruthy();

      //  Click "Done", verify popup no longer displayed
      await driver.findElement(By.xpath(
        '//button/span[text()="Done"]')).click();
      await driver.wait(until.elementIsNotVisible(popup));
      displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();

      //  Verify that the PP icon is now displayed
      let icon = await driver.findElement(By.css(
        "g.snow_profile_grain_icons image"));
      let altAttr = await icon.getAttribute('alt');
      expect(altAttr).toEqual('PP');
    });
  }); // describe('popup Primary Grain Shape operation

  /**
   * Test suite for Primary Grain Subshape operation of popup
   */
  describe('popup Primary Grain Subshape operation:', function() {

    test('Select stellar displays PPsd icon', async () => {

      //  Open the edit popup
      let button = await driver.findElement(By.css(
        'use.snow_profile_button_edit:first-of-type')).click();
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.wait(until.elementIsVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeTruthy();

      //  Select Primary Grain Shape: Precipitation Particles
      await driver.findElement(By.xpath(
        '//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]')).click();
      //  Verify that Primary Subshape is displayed
      let primarySubshape = await driver.findElement(By.id(
        'snow_profile_primary_grain_subshape_PP'));
      displayed = await primarySubshape.isDisplayed();
      expect(displayed).toBeTruthy();

      // Select Primary Subshape: Stellars
      await driver.findElement(By.xpath(
        '//select[@id="snow_profile_primary_grain_subshape_PP"]/option[@value="PPsd"]')).click();

      //  Click "Done", verify popup no longer displayed
      await driver.findElement(By.xpath(
        '//button/span[text()="Done"]')).click();
      await driver.wait(until.elementIsNotVisible(popup));
      displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();

      //  Verify that the stellar icon is now displayed
      let icon = await driver.findElement(By.css(
        "g.snow_profile_grain_icons image"));
      let altAttr = await icon.getAttribute('alt');
      expect(altAttr).toEqual('PPsd');
    });
  }); // describe('Select stellar displays PPsd icon

  /**
   * Test suite for initialization of second popup
   */
  describe('Second popup initialization:', function() {

    test('First popup selects a grain shape for layer 1', async () => {

      //  Open the edit popup
      let button = await driver.findElement(By.css(
        'use.snow_profile_button_edit:first-of-type')).click();
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.wait(until.elementIsVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeTruthy();

      //  Previous grain shape/subshape will be used.
      //  Click "Done", verify popup no longer displayed
      await driver.findElement(By.xpath(
        '//button/span[text()="Done"]')).click();
      await driver.wait(until.elementIsNotVisible(popup));
      displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();
    });

    test('Open second popup', async () => {

      //  Open the second edit popup
      let button = await driver.findElement(By.css(
        'use.snow_profile_button_edit:nth-of-type(2)')).click();
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.wait(until.elementIsVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeTruthy();
    });

    //  Test for valid initial state of popup
    testPopupInit();

    //  Use Cancel to dismiss second popup
    test('Cancel button dismisses popup', async () => {
      let popup = await driver.findElement(By.id('snow_profile_popup'));
      await driver.findElement(By.xpath(
        '//button/span[text()="Cancel"]')).click();
      await driver.wait(until.elementIsNotVisible(popup));
      let displayed = await popup.isDisplayed();
      expect(displayed).toBeFalsy();
    });
  });

}); // decribe('Snow Profile diagram popups'

/*
 *  Test popup initial state
 */
async function testPopupInit() {
  test('Primary Grain Shape selector is visible', async () => {
    let primaryShape = await driver.findElement(By.id(
      'snow_profile_primary_grain_shape'));
    let displayed = await primaryShape.isDisplayed();
    expect(displayed).toBeTruthy();
  });

  // FIXME: should test that none of the subshape selectors visible
  test('Primary Grain Subshape selector not visible', async () => {
    let primarySubshape = await driver.findElement(By.id(
      'snow_profile_primary_grain_subshape_PP'));
    let displayed = await primarySubshape.isDisplayed();
    expect(displayed).toBeFalsy();
  });

  test('Secondary Grain Shape selector is not visible', async () => {
    let secondaryShape = await driver.findElement(By.id(
      'snow_profile_secondary_grain_shape'));
    let displayed = await secondaryShape.isDisplayed();
    expect(displayed).toBeFalsy();
  });

  test('Secondary Grain Subshape selector not visible', async () => {
    let secondarySubshape = await driver.findElement(By.id(
      'snow_profile_secondary_grain_subshape_PP'));
    let displayed = await secondarySubshape.isDisplayed();
    expect(displayed).toBeFalsy();
  });

  test('Grain Size selector is visible', async () => {
    let grainSize = await driver.findElement(By.id(
      'snow_profile_grain_size'));
    let displayed = await grainSize.isDisplayed();
    expect(displayed).toBeTruthy();
  });

  test('Comment field is visible', async () => {
    let comment = await driver.findElement(By.id(
      'snow_profile_comment'));
    let displayed = await comment.isDisplayed();
    expect(displayed).toBeTruthy();
  });
}

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
