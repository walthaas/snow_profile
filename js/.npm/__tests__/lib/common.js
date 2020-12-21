/**
 * @file Common defines for Jest tests
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

"use strict";

//  URL of page to test
let testURL = 'file://' + process.cwd() + '/__tests__/lib/test.html';
//let testURL = 'file://' + process.cwd() + '/../../snow_profile.html';
//let testURL = 'http://utahavalanchecenter.org/snow_profile/snow_profile.html';
//let testURL = 'http://sandbox.utahavalanchecenter.org/snow_profile/snow_profile.html';
exports.testURL = testURL;

// How to find handles on the page
let handleXpath = "//*[name()='rect'][@class='snow_profile_handle']";
exports.handleXpath = handleXpath;

let SnowProfile = {};
exports.SnowProfile = SnowProfile;

// Selenium WebDriver
const {Builder, By, Key, until} = require('selenium-webdriver');
exports.Builder = Builder;
exports.By = By;
exports.Key = Key;
exports.until = until;
let driver = new Builder().forBrowser("chrome").setAlertBehavior('accept').build();
exports.driver = driver;

/**
 * Load page
 *
 * driver.get() returns when the page has loaded, but before the scripts
 * on the page have finished building the page.  Therefore we wait until
 * the page JS has finished building the last element it builds.
 * Then load SnowProfile.Cfg from the page.
 */
exports.loadPage = async () => {

  // Load the test page
  await driver.get(testURL);

  let init_layers = await(driver.executeScript(
    'return window.SnowProfile.Cfg.NUM_INIT_LAYERS'));
  let xpath = handleXpath + '[' + (init_layers).toString() + ']';

  // Wait until last handle is available
  await driver.wait(until.elementLocated(By.xpath(xpath)), 10000);

  // Get configuration SnowProfile.Cfg from the page JS
  SnowProfile.Cfg = await driver.executeScript(
    'return window.SnowProfile.Cfg');
};

/**
 * Click last Insert button, wait until layer is created.
 */
exports.clickLastInsert = async () => {
  let lastButton = await driver.findElement(
    By.css("use.snow_profile_button_insert:last-of-type"));
  let buttons = await driver.findElements(
    By.css("use.snow_profile_button_insert"));
  let Obuttons = buttons.length;
  await lastButton.click();
  buttons = await driver.findElements(
    By.css("use.snow_profile_button_insert"));
  let Nbuttons = buttons.length;
  expect(Nbuttons).toEqual(Obuttons + 1);
  let editButton = await driver.findElement(
    By.css('use.snow_profile_button_edit:nth-of-type(' + Nbuttons + ')'));
  let displayed = await editButton.isDisplayed();
  expect(displayed).toBeTruthy();
};

/**
 * Store comment into popup comment field.
 */
async function setFeaturesComment(comment) {

  if ((comment === null) || (comment === undefined)) {
    comment = '';
  }


  // Store new value in the grain size min text box
  let element =  await driver.findElement(By.id('snow_profile_comment'));
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
   comment + Key.TAB);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(comment);
}

/**
 * Set grain shape in Snow Layer Description
 */
async function setFeaturesShape(shape) {
  let primaryShape,
    primarySubShape,
    secondaryShape,
    secondarySubShape;

  // Shape is a string specifying primary shape, or an array of two
  // strings specifying primary or seconday shape.  May be null.
  if ((shape === null) && (shape === undefined)) {
    //FIXME should blank shape field
    return;
  }

  // If shape info was supplied, parse the info into
  // primary and secondary shape and subshape
  if (Object.prototype.toString.call(shape) === '[object Array]') {
    if (shape[0].length === 4) {
      primaryShape = shape[0].substr(0,2);
      primarySubShape = shape[0];
    }
    else {
      primaryShape = shape[0];
    }
    if (shape[1].length === 4) {
      secondaryShape = shape[1].substr(0,2);
      secondarySubShape = shape[1];
    }
    else {
      secondaryShape = shape[1];
    }
  }
  else {
    if (shape.length === 4) {
      primaryShape = shape.substr(0,2);
      primarySubShape = shape;
    }
    else {
      primaryShape = shape;
    }
  }

  // Store primary shape info
  await driver.findElement(By.xpath(
    '//select[@id="snow_profile_primary_grain_shape"]/option[@value="' +
    primaryShape + '"]'))
    .click();

  // If primary subshape info found, store that
  if (primarySubShape !== undefined) {
    await driver.findElement(By.xpath(
      '//select[@id="snow_profile_primary_grain_subshape_' + primaryShape +
        '"]/option[@value="' + primarySubShape + '"]')).click();
  }

  // If secondary shape info found, store that
  if (secondaryShape !== undefined) {
    await driver.findElement(By.xpath(
      '//select[@id="snow_profile_secondary_grain_select"]/option[@value="' +
      secondaryShape + '"]')).click();
    if (secondarySubShape !== undefined) {
      await driver.findElement(By.xpath(
        '//select[@id="snow_profile_secondary_grain_subshape_' +
        secondaryShape +'"]/option[@value="' +
        secondarySubShape + '"]')).click();
    }
  }
}

/**
 * Set grain size.
 */
async function setFeaturesSize(size) {
  let sizeMin, sizeMax;

  // Size is a number specifying grain size, or an array of two
  // numbers specifying a range of sizes.  May be null.
  if ((size === null) || (size === undefined)) {
    sizeMin = '';
    sizeMax = '';
  } else if (Object.prototype.toString.call(size) === '[object Array]') {
    sizeMin = String(size[0]);
    sizeMax = String(size[1]);
  }
  else {
    sizeMin = String(size);
    sizeMax = '';
  }

  // Store new value in the grain size min text box
  let element =  await driver.findElement(By.id('snow_profile_grain_size_min'));
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
   sizeMin + Key.ENTER);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(sizeMin);

  // Store new value in the grain size max text box
  element =  await driver.findElement(By.id('snow_profile_grain_size_max'));
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
   sizeMax + Key.ENTER);

  // Wait until the new value verifies
  text = await element.getAttribute('value');
  expect(text).toBe(sizeMax);
}

/**
 * Set layer features
 *
 * @param {number} index Layer number. Top layer is zero.
 * @param {string} shape
 * @param {number} size
 * @param {string} comment
 */
exports.setFeatures = async (index, shape, size, comment) => {
  //console.log('setFeatures(', index, shape, size, comment, ')');

  // Click the Edit button for the layer to open the popup.
  let button = await driver.findElement(By.css(
    'use.snow_profile_button_edit:nth-of-type(' + (index + 1) + ')'));
  await driver.wait(until.elementIsVisible(button));
  //console.log('button at x=%d, y=%d',
  //            await button.getAttribute('x'), await button.getAttribute('y'));
  await button.click();
  let popup = await driver.findElement(By.id('snow_profile_popup'));
  await driver.wait(until.elementIsVisible(popup));
  let displayed = await popup.isDisplayed();
  expect(displayed).toBeTruthy();

  // Set grain shape
  await setFeaturesShape(shape);

  // Set grain size
  await setFeaturesSize(size);

  // Set comment
  setFeaturesComment(comment);

  //  Click "Done", verify popup no longer displayed
  await driver.findElement(By.xpath(
    '//button/span[text()="Done"]')).click();
  await driver.wait(until.elementIsNotVisible(popup));
  displayed = await popup.isDisplayed();
  expect(displayed).toBeFalsy();
};

/**
 * Move a handle to specified depth and hardness
 *
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Target depth to move to, in cm from surface.
 * @param {string} hardness Hand hardness code.
 * @return {Promise} Promise resolved when the move is complete.
 */
exports.moveHandle = async function moveHandle(index, depth, hardness) {

  let handles = await driver.findElements(By.css('rect.snow_profile_handle'));
  expect(index).toBeLessThan(handles.length);
  let handle = handles[index];
  let x = parseFloat(await handle.getAttribute('x'));
  let y = parseFloat(await handle.getAttribute('y'));
  let newY = await driver.executeScript(
    "return window.SnowProfile.depth2y(" + depth + ");");
  let newX = await driver.executeScript(
    "return window.SnowProfile.code2x('" + hardness + "')");
  let offsetX = Math.ceil(newX - x);
  let offsetY = Math.ceil(newY - y);
  //const actions = driver.actions({async: true});
  const actions = driver.actions();
  await actions.dragAndDrop(handle, {x: offsetX, y: offsetY}).perform();
};

/**
 * Test position of a handle.
 *
 * @param {number} index Handle number. Top handle is zero.
 * @param {number} depth Expected depth in cm
 * @param {string} hardness Expected hand hardness code
 */
exports.testHandle = async function testHandle(index, depth, hardness) {

  // Find the handle to be tested
  let handles = await driver.findElements(By.css('rect.snow_profile_handle'));
  expect(index).toBeLessThan(handles.length);
  let handle = handles[index];

  // Get the current location of the handle
  let attrX = parseFloat(await handle.getAttribute('x'));
  let attrY = parseFloat(await handle.getAttribute('y'));

  // Get the expected location
  let expectedY = await driver.executeScript(
    "return window.SnowProfile.depth2y(" + depth + ");");
  //console.log('depth=%d y=%d', depth, expectedY);
  let expectedX = await driver.executeScript(
    "return window.SnowProfile.code2x('" + hardness + "')");

  // Expected and actual should be close
  expect(Math.abs(attrX - expectedX)).toBeLessThan(1);
  expect(Math.abs(attrY - expectedY)).toBeLessThan(1);
};

/*
 * Set the pit depth
 */
exports.setPitDepth = async function(depth) {
  let depthText = depth.toString();

  // Store new value in the pit depth text box
  let element =  await driver.findElement(By.id('snow_profile_pit_depth'));
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
    depthText + Key.ENTER);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(depthText);
};

/*
 * Set the total snow depth
 */
exports.setSnowDepth = async function(depth) {

  let depthText = depth.toString();

  // Clear the snow depth text box
  let element =  await driver.findElement(By.id('snow_profile_total_depth'));
  await element.clear();

  // Enter new depth, then navigate away from text box
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
    depthText + Key.ENTER);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(depthText);
};

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
