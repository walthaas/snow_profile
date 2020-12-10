/**
 * @file Jest tests for the reference grid
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
let SnowProfile = com.SnowProfile;

// Test the reference grid
describe('Reference grid:', function() {

  beforeAll(async () => {
    loadPage();
  });

  // When done, kill the browser
  afterAll(async () => {
    await driver.quit();
  });

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
   *  Check that the selector to choose between surface and ground
   *  reference is not visible now since snow depth is unknown
   */
  test('the reference depth selector shall not be displayed',  async () => {
    let selector = await driver.findElement(By.id('snow_profile_ref_depth'));
    let display = await selector.getCssValue('display');
    expect(display).toBe('none');
  });

  /*
   *  Check the default depth reference
   */
  test('depth reference shall default to surface', async () => {
    let depthRef = await driver.executeScript(
            'return window.SnowProfile.depthRef');
    expect(depthRef).toBe('s');
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
   *  Check the depth labels at default pit depth
   */
  test('Depth labels shall match default', async () => {

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(
      SnowProfile.Cfg.DEFAULT_PIT_DEPTH, null, 's');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels).toEqual(expectedLabels);
  });

  /*
   * Setting snow depth changes reference, pit depth
   */
  test('Setting snow depth changes reference, pit depth', async () => {

    // Set total depth 200
    await setSnowDepth(200);

    // Verify that reference select is now visible
    let select = await driver.findElement(By.id('snow_profile_ref_select'));
    await driver.wait(until.elementIsVisible(select));

    // Verify that the reference is now 'ground'
    let depthRef = await driver.executeScript(
            'return window.SnowProfile.depthRef');
    expect(depthRef).toBe('g');
  });

  /*
   *  Check the depth labels at a shallow pit depth with snow depth set.
   */
  test('Depth labels should adjust for shallow pit depth', async () => {
    let snowDepth = 173
    await setSnowDepth(snowDepth);
    let pitDepth = 17;
    await setPitDepth(pitDepth);

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(pitDepth, snowDepth, 'g');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels.sort()).toEqual(expectedLabels.sort());
 });

  /*
   * Check the depth labels at a deep pit depth
   */
  test('Depth labels should adjust for deep pit depth', async () => {
    let snowDepth = SnowProfile.Cfg.MAX_DEPTH;
    await setSnowDepth(snowDepth);
    let pitDepth = SnowProfile.Cfg.MAX_DEPTH - 17;
    await setPitDepth(pitDepth);

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(pitDepth, snowDepth, 'g');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels.sort()).toEqual(expectedLabels.sort());
  });

  /*
   * Check depth labels reference to surface
   */
  test('Depth labels should adjust for surface reference', async () => {

    // Define a pit
    let snowDepth = 142
    await setSnowDepth(snowDepth);
    let pitDepth = 63;
    await setPitDepth(pitDepth);

    // Change reference to 's'
    let reference = await driver.findElement(By.css(
      '#snow_profile_ref_select option[value="s"]'));
    await reference.click();
    let value = await reference.getAttribute('value');
    expect(value).toEqual('s');

    //Read the depth scale text elements now on the diagram into depthLabels[]
    let expectedLabels = calcDepthLabels(63, null, 's');
    let elements = await driver.findElements(
      By.css('#snow_profile_diagram svg text.snow_profile_depth'));
    let texts = elements.map(element => element.getText());
    let depthLabels = await Promise.all(texts);

    // Compare the depth labels now on the diagram to what is expected
    expect(depthLabels.sort()).toEqual(expectedLabels.sort());
  });

}); // decribe('reference grid

/*
 *  Calculate the depth labels we expect to see on the diagram
 *  The labels depend on pit depth, snow depth and whether reference is
 *  surface or ground.  If the reference is surface then the snow depth is
 *  not used.
 */
function calcDepthLabels(pitDepth, snowDepth, reference) {
  let depthLabels = ['Depth (cm)'];
  if (reference === 's') {
    // Labels start at the surface
    for (let d = 0; d <= pitDepth; d += SnowProfile.Cfg.DEPTH_LINE_INT) {
      depthLabels.push(String(d));
    }
  } else {
    // Labels start at the ground
    // Calculate the top label as a multiple of SnowProfile.Cfg.DEPTH_LINE_INT
    let top = snowDepth - (snowDepth % SnowProfile.Cfg.DEPTH_LINE_INT);
    for (let d = top; d >= snowDepth - pitDepth;
      d -= SnowProfile.Cfg.DEPTH_LINE_INT) {
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
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
    depthText + Key.ENTER);

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
  await element.clear()

  // Enter new depth, then navigate away from text box
  await element.sendKeys(Key.HOME, Key.chord(Key.SHIFT, Key.END),
    depthText + Key.ENTER);

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
