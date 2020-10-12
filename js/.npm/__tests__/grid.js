/**
 * @file Jest tests for the reference grid
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

"use strict";

const {Builder, By, Key, until} = require('selenium-webdriver');
let com = require('./lib');

var SnowProfile = {};
var driver;

// Test the reference grid
describe('Reference grid:', function() {

  // Store info read from the page being tested
  let hardnessLabels = [];

  beforeAll(async () => {
    driver = new Builder().forBrowser("chrome").build();

    // Load the test page
    await driver.get(com.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    SnowProfile.Cfg = await driver.executeScript(
      'return window.SnowProfile.Cfg');
  });  // beforeAll(

  test('title shall be Snow Profile Editor', async () => {
    const title = await driver.getTitle();
    expect(title).toBe('Snow Profile Editor');
  });

  /*
   *  Check that there is exactly one SVG block
   */
  test('snow profile diagram shall have one svg block', async () => {
    let selectors = await driver.findElements(
      By.css('#snow_profile_diagram svg'));
    expect(selectors.length).toBe(1);
  });

  /*
   *  Check that there is no selector to choose between surface and ground
   *  reference now since snow depth is unknown
   */
  test('the reference depth selector shall not be displayed',  async () => {
    let selector = await driver.findElement(By.id('snow_profile_ref_depth'));
    let display = await selector.getCssValue('display');
    expect(display).toBe('none');
  });

  /*
   *  Check the hardness scale labels
   */
  test('verify hardness scale labels', async () => {
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_hardness'));
    let texts = elements.map(element => element.getText());
    let hardnessLabels = await Promise.all(texts);
    expect(hardnessLabels).toEqual(
      [ 'F', '4F', '1F', 'P', 'K', 'I', 'Hand Hardness' ]);
  });

  /*
   *  Check the default depth reference
   */
  test('depth reference shall default to surface', async () => {
    let depthRef = await
      driver.executeScript('return window.SnowProfile.depthRef');
    expect(depthRef).toBe('s');
  });

  /*
   *  Check the depth labels at default pit depth
   */
  test('Depth labels shall match default', async () => {

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(
          SnowProfile.Cfg.DEFAULT_PIT_DEPTH, 's');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels).toEqual(expectedLabels);
  });

  /*
   *  Check the depth labels at minimum pit depth.  Setting a pit depth
   *  should change the reference from Surface to Ground.
   */
  test('Depth labels should adjust for minimum pit depth', async () => {
    await setPitDepth(50);

    // Wait until the new value verifies
    let pitDepthElem = await driver.findElement(By.id('snow_profile_pit_depth'));
    let pitDepthText = await pitDepthElem.getAttribute('value');
    expect(pitDepthText).toBe('50');

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(50, 'g');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels).toEqual(expectedLabels);
 });

  /*
   * Check the depth labels at maximum pit depth
   */
  test('Depth labels should adjust for maximum pit depth', async () => {
    await setPitDepth(SnowProfile.Cfg.MAX_DEPTH);

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(SnowProfile.Cfg.MAX_DEPTH, 'g');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels).toEqual(expectedLabels);
  });

  /*
   * Setting total depth changes reference, pit depth
   */
  test('Setting total depth changes reference, pit depth', async () => {
    // Set total depth 200
    setSnowDepth(200);

    // Verify that reference select is now visible
    let select = await driver.findElement(By.id('snow_profile_ref_select'));
    await driver.wait(until.elementIsVisible(select));

    // Verify that the reference is now 'ground'
    let depthRef = await
      driver.executeScript('return window.SnowProfile.depthRef');
    expect(depthRef).toBe('g');
  });

  /*
   * Setting pit depth changes labels
   */
  test('Setting pit depth changes labels', async () => {

    // Set pit depth 100, then verify depth labels
    setPitDepth(100);
    //FIXME wait until JS on page updates the labels
    // Two bugs cancel out: labels calculated incorrectly because pit
    // depth not taken into account, and the JS hasn't had time to change.
    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(200, 'g');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels).toEqual(expectedLabels);
  })
 //    // Change reference to 's'
 //    driver.findElement(sw.By.xpath(
 //      '//select[@id="snow_profile_ref_select"]/option[@value="s"]'))
 //      .then(function(elmt) {
 //        elmt.click();
 //      });
 //    // Verify depth labels
 //    driver.findElements(sw.By.css(
 //      '#snow_profile_diagram svg text.snow_profile_depth'))
 //      .then(function(done) {
 //        depthLabels = [];
 //        done.forEach(function(promise) {
 //          promise.getText()
 //            .then(function(done) {
 //              depthLabels.push(done);
 //            });
 //          });
 //        })
 //      .then(function() {
 //        expectLabels = ['Depth (cm)'];
 //        for (var d = 0; d <= 100; d += SnowProfile.Cfg.DEPTH_LINE_INT) {
 //          expectLabels.push(String(d));
 //        }
 //        depthLabels.sort();
 //        expectLabels.sort();
 //        chai.expect(depthLabels.length).to.equal(expectLabels.length);
 //        // Depth increment labels should match default from '0'
 //        // to '100' by increments of DEPTH_LINE_INT
 //        expectLabels.forEach(function(v, i) {
 //          chai.expect(depthLabels[i]).to.equal(v);
 //        });
 //      });
 // });

  // When done, kill the browser
  afterAll(async () => {
    await driver.quit();
  })

}); // decribe('reference grid

/*
 *  Calculate the depth labels we expect to see on the diagram
 *  The labels depend on pit depth and whether reference is surface or ground
 *  FIXME the depth labels depend on both total snow depth and pit depth
 */
function calcDepthLabels(depth, reference) {
  let depthLabels = ['Depth (cm)'];
  if (reference = 's') {
    // Labels start at the surface
    for (let d = 0; d <= depth; d += SnowProfile.Cfg.DEPTH_LINE_INT) {
      depthLabels.push(String(d));
    }
  } else {
    // Labels start at the ground
    // Calculate the top label as a multiple of SnowProfile.Cfg.DEPTH_LINE_INT
    let top = depth - (depth % SnowProfile.Cfg.DEPTH_LINE_INT);
    for (let d = top; d >= 0; d -= SnowProfile.Cfg.DEPTH_LINE_INT) {
      depthLabels.push(String(d));
    }
  }
  return depthLabels;
}

/*
 * Set the pit depth
 */
async function setPitDepth(depth) {

  let depthText = depth.toString();

  // Clear the pit depth text box
  let element =  await driver.findElement(By.id('snow_profile_pit_depth'));
  await element.sendKeys(Key.CONTROL + 'a' + Key.DELETE);

  // Enter new depth, then navigate away from text box
  await element.sendKeys(depthText + Key.TAB);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(depthText);
}

/*
 * Set the total snow depth
 */
async function setSnowDepth(depth) {

  let depthText = depth.toString();

  // Clear the snow depth text box
  let element =  await driver.findElement(By.id('snow_profile_total_depth'));
  await element.sendKeys(Key.CONTROL + 'a' + Key.DELETE);

  // Enter new depth, then navigate away from text box
  await element.sendKeys(depth.toString() + Key.TAB);

  // Wait until the new value verifies
  let text = await element.getAttribute('value');
  expect(text).toBe(depthText);
}

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
