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

// How to find buttons on the page
let buttonsXpath = "//*[name()='svg']/*[name()='g']/*[name()='g']" +
  "/*[name()='g']";
exports.buttonsXpath = buttonsXpath;

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
let driver = new Builder().forBrowser("chrome").build();
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
}

/**
 * Click last Insert button, wait until layer is created.
 */
exports.clickLastInsert = () => {
  // @todo convert
  // let numButtons,
  //     insertStarted = false,
  //     insertDone = false;

  // driver.findElements(By.css("use.snow_profile_button_insert"))
  //   .then(function(buttons) {
  //     numButtons = buttons.length;
  //   })
  //   .then(function() {
  //     driver.wait(function() {
  //       if (!insertStarted) {
  //         driver.executeScript(
  //           "$('use.snow_profile_button_insert:nth-of-type(" +
  //           numButtons + ")').click()")
  //         insertStarted = true;
  //       }
  //       driver.isElementPresent(By.css(
  //         "use.snow_profile_button_edit:nth-of-type(" +
  //         (numButtons + 1) + ")"))
  //         .then(function(done) {
  //           insertDone = done;
  //         });
  //       return insertDone;
  //     }, 2000, "clickLastInsert didn't finish")
  //   });
}

/**
 * Click Done, then wait until modal popup goes away
 */
exports.clickDone = () => {
  // @todo convert
  // let overlayPresent = true;

  // driver.findElement(By.xpath('//button[.="Done"]'))
  //   .then(function(elmt) {
  //     elmt.click();
  //    })
  //   .then(function() {driver.wait(function() {
  //     driver.isElementPresent(By.css('div.ui-widget-overlay'))
  //       .then(function(done) {
  //           overlayPresent = done;
  //       })
  //       return !overlayPresent;
  //     }, 2000, "overlay didn't go away");
  //   })
}

/**
 * Store comment into popup comment field.
 */
async function setFeaturesComment(comment) {
  // @todo convert

  // if ((comment === null) || (comment === undefined)) {
  //   return;
  // }

  // // If there is existing comment text, erase it
  // let element =  await driver.findElement(By.id('snow_profile_comment'));
  // await element.sendKeys(Key.CONTROL + 'a' + Key.DELETE);

  // // type in the comment
  // await element.sendKeys(comment + Key.TAB);
}

/**
 * Set grain shape in Snow Layer Description
 */
function setFeaturesShape(shape) {
  // @todo convert
  // var primaryShape,
  //   primarySubShape,
  //   secondaryShape,
  //   secondarySubShape;

  // // Shape is a string specifying primary shape, or an array of two
  // // strings specifying primary or seconday shape.  May be null.
  // if ((shape === null) && (shape === undefined)) {
  //   return;
  // }

  // // If shape info was supplied, parse the info into
  // // primary and secondary shape and subshape
  // if (Object.prototype.toString.call(shape) === '[object Array]') {
  //   if (shape[0].length === 4) {
  //     primaryShape = shape[0].substr(0,2);
  //     primarySubShape = shape[0];
  //   }
  //   else {
  //     primaryShape = shape[0];
  //   }
  //   if (shape[1].length === 4) {
  //     secondaryShape = shape[1].substr(0,2);
  //     secondarySubShape = shape[1];
  //   }
  //   else {
  //     secondaryShape = shape[1];
  //   }
  // }
  // else {
  //   if (shape.length === 4) {
  //     primaryShape = shape.substr(0,2);
  //     primarySubShape = shape;
  //   }
  //   else {
  //     primaryShape = shape;
  //   }
  // }

  // // Store primary shape info
  // driver.findElement(By.xpath(
  //   '//select[@id="snow_profile_primary_grain_shape"]/option[@value="' +
  //   primaryShape + '"]'))
  //   .click();

  // // If primary subshape info found, store that
  // if (primarySubShape !== undefined) {
  //   driver.wait(function() {
  //     return driver.isElementPresent(By.xpath(
  //       '//select[@id="snow_profile_primary_grain_subshape_' + primaryShape +
  //       '"]'));
  //     }, 2000, 'subselect for ' + primaryShape + ' not found')
  //     .then(function() {
  //        driver.findElement(By.xpath(
  //         '//select[@id="snow_profile_primary_grain_subshape_' +
  //         primaryShape + '"]/option[@value="' + primarySubShape + '"]'))
  //         .click();
  //     });
  // }

  // // If secondary shape info found, store that
  // if (secondaryShape !== undefined) {
  //   driver.wait(function() {
  //     return driver.isElementPresent(By.xpath(
  //       '//select[@id="snow_profile_secondary_grain_select"]'));
  //     }, 2000, 'snow_profile_secondary_grain_select not found')
  //     .then(function() {
  //       driver.findElement(By.xpath(
  //         '//select[@id="snow_profile_secondary_grain_select"]/option[@value="'
  //         + secondaryShape + '"]'))
  //         .click();
  //     });
  //   if (secondarySubShape !== undefined) {
  //     driver.wait(function() {
  //       return driver.isElementPresent(By.xpath(
  //         '//select[@id="snow_profile_secondary_grain_subshape_' +
  //         secondaryShape + '"]'));
  //     }, 2000, 'snow_profile_secondary_grain_subshape select not found')
  //     .then(function() {
  //       driver.findElement(By.xpath(
  //         '//select[@id="snow_profile_secondary_grain_subshape_' +
  //         secondaryShape +'"]/option[@value="' + secondarySubShape +
  //         '"]'))
  //         .click();
  //     });
  //   }
  // }
}

/**
 * Set grain size.
 */
function setFeaturesSize(size) {
  // @todo convert
  // var cmdStrMin = [],
  //   cmdStrMax = [],
  //   i,
  //   minDone = false,
  //   maxDone = false,
  //   sizeMin,
  //   sizeMax;

  // // Size is a number specifying grain size, or an array of two
  // // numbers specifying a range of sizes.  May be null.
  // if ((size === null) || (size === undefined)) {
  //   return;
  // }

  // if (Object.prototype.toString.call(size) === '[object Array]') {
  //   sizeMin = String(size[0]);
  //   sizeMax = String(size[1]);
  // }
  // else {
  //   sizeMin = String(size);
  // }

  // // If there is existing minimum grain size, erase it
  // driver.executeScript('return $("#snow_profile_grain_size_min").val()')
  //   .then(function(val) {
  //     if (val.length > 0) {
  //       for (i = 0; i < val.length; i++) {
  //         cmdStrMin.push(Key.BACK_SPACE);
  //       }
  //       cmdStrMin.push(Key.NULL);
  //     }
  //   });

  // // After backspacing over existing contents of input box,
  // // type in the minimum grain size
  // driver.findElement(By.css('#snow_profile_grain_size_min'))
  //   .then(function(elmt) {
  //     cmdStrMin.push(sizeMin);
  //     elmt.sendKeys.apply(elmt, cmdStrMin);
  //   });

  // // Wait until new minimum size is stored
  // driver.wait(function() {
  //   driver.executeScript('return $("#snow_profile_grain_size_min").val()')
  //     .then(function(val) {
  //       if (val === sizeMin) {
  //         minDone = true;
  //       }
  //   });
  //   return minDone;
  // }, 2000, "minimum grain size wasn't stored");

  // if (sizeMax !== undefined) {
  //   // If there is existing maximum grain size, erase it
  //   driver.executeScript('return $("#snow_profile_grain_size_max").val()')
  //     .then(function(val) {
  //       if (val.length > 0) {
  //         for (i = 0; i < val.length; i++) {
  //           cmdStrMax.push(Key.BACK_SPACE);
  //         }
  //         cmdStrMax.push(Key.NULL);
  //       }
  //     });

  //   // After backspacing over existing contents of input box,
  //   // type in the maximum grain size
  //   driver.findElement(By.css('#snow_profile_grain_size_max'))
  //     .then(function(elmt) {
  //       cmdStrMax.push(sizeMax);
  //       elmt.sendKeys.apply(elmt, cmdStrMax);
  //     });

  //   // Wait until new maximum size is stored
  //   driver.wait(function() {
  //     driver.executeScript('return $("#snow_profile_grain_size_max").val()')
  //       .then(function(val) {
  //         if (val === sizeMax) {
  //           maxDone = true;
  //         }
  //     });
  //     return maxDone;
  //   }, 2000, "maximum grain size wasn't stored");
  // }
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
  console.log('setFeatures(%d, %s, %d, %s)', index, shape, size, comment);;
  // @todo convert
  // var popupDisplayed;

  // // Click the Edit button for the layer to open the popup.
  // driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(" +
  //   (index + 1) + ")').click()")
  //   .then(function() {
  //     driver.wait(function() {
  //       return driver.findElement(By.css('div#snow_profile_popup'))
  //        .isDisplayed();
  //      }, 2000, 'div#snow_profile_popup not found')
  //   })
  //   .then(function() {

  //     // Set grain shape
  //     setFeaturesShape(shape);

  //     // Set grain size
  //     setFeaturesSize(size);

  //     // Set comment
  //     setFeaturesComment(comment);

  //     // Click the Done button to save the features
  //     driver.findElement(By.xpath('//button[.="Done"]')).click();

  //     // Wait for the popup to disappear
  //     driver.wait(function() {
  //       driver.findElement(By.css('div#snow_profile_popup'))
  //         .then(function(popup) {
  //           popupDisplayed = popup.isDisplayed();
  //         });
  //       return !popupDisplayed;
  //     }, 2000, "popup didn't go away");
  //   });
}

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
  const actions = driver.actions({async: true});
  await actions.dragAndDrop(handle, {x: offsetX, y: offsetY}).perform();
  handles = await driver.findElements(By.css('rect.snow_profile_handle'));
}

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
  console.log('depth=%d y=%d', depth, expectedY);
  let expectedX = await driver.executeScript(
    "return window.SnowProfile.code2x('" + hardness + "')");

  // Expected and actual should be close
  expect(Math.abs(attrX - expectedX)).toBeLessThan(1);
  expect(Math.abs(attrY - expectedY)).toBeLessThan(1);
}

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
