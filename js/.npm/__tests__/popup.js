/**
 * @file Jest tests for the popups
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
let SnowProfile = {};

// Test the popups
describe('Popup:', function() {

  /**
   * Initialize, load the test page and read
   * the static configuration variables from the page JS
   */
  beforeAll(async () => {

    // Load the test page
    await driver.get(com.testURL);

    // Get configuration SnowProfile.Cfg from the page JS
    SnowProfile.Cfg = await driver.executeScript(
      'return window.SnowProfile.Cfg');

  });  // beforeAll(

  /**
   * Test suite for initial conditions of a fresh page
   */
  describe('popup page initial conditions:', function() {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('right initial number of buttons', async () => {
      // @todo Convert this test
      // driver.findElements(By.css('use'))
      //   .then(function(done) {
      //     chai.expect(done.length).to.equal(2 * SnowProfile.Cfg.NUM_INIT_LAYERS);
      //   });
    });

    test('popup is not displayed', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_popup'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

  });  // describe('popup page initial conditions

  /**
   * Test suite for initial conditions of popup
   */
  describe('popup initial conditions:', function() {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('click on edit button creates popup', async () => {
      // @todo Convert this test
      // driver.executeScript(
      //   "$('use.snow_profile_button_edit:nth-of-type(2)').click()")
      //   .then(function() {
      //     driver.findElement(By.id('snow_profile_popup'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //         .then(function(displayed) {
      //           chai.expect(displayed).to.be.true;
      //       });
      //     });
      //   });
    });

    test('Primary Grain Shape selector is visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_primary_grain_shape'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });

    test('Primary Grain Subshape selector not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_primary_grain_subshape_PP'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Secondary Grain Shape selector is not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_secondary_grain_shape'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Secondary Grain Subshape selector not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_secondary_grain_subshape_PP'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Grain Size selector is visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_grain_size'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });

    test('Comment field is visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_comment'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });
  });  // describe('popup initial conditions

  /**
   * Test suite for "Cancel" button operation of popup
   */
  describe('popup "Cancel" button operation:', function () {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('click on edit button creates popup', async () => {
      // @todo Convert this test
      // driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
      //   .then(async () => {
      //     driver.wait(function() {
      //       return driver.findElement(By.css('div#snow_profile_popup'))
      //        .isDisplayed();
      //      }, 2000, 'div#snow_profile_popup not found')
      //   })
      //   .then(function() {
      //     driver.findElement(By.id('snow_profile_popup'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //         .then(function(displayed) {
      //           chai.expect(displayed).to.be.true;
      //         });
      //       });
      //   });
    });

    test('Cancel button dismisses popup', async () => {
      // @todo Convert this test
      // driver.findElement(By.xpath('//button[.="Cancel"]'))
      //   .then(function(elmt) {
      //     elmt.click();
      //   });
    });

    test('popup no longer displayed', async () => {
      // driver.findElement(By.id('snow_profile_popup'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    })
  });  // describe('popup "Cancel" button operation

  /**
   * Test suite for Primary Grain Shape operation of popup
   */
  describe('popup Primary Grain Shape operation:', function() {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('Select Primary Grain Shape PP displays PP icon', async () => {
      // @todo Convert this test
      // driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
      //   .then(function() {
      //     driver.wait(function() {
      //       return driver.findElement(By.css('div#snow_profile_popup'))
      //        .isDisplayed();
      //      }, 2000, 'div#snow_profile_popup not found')
      //   })
      //   .then(function() {
      //     driver.findElement(By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
      //     .then(function(elmt) {
      //       elmt.click();
      //     })
      //   })
      //   .then(function() {
      //     driver.findElement(By.id('snow_profile_primary_grain_subshape_PP'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //           .then(function(displayed) {
      //             chai.expect(displayed).to.be.true;
      //       })
      //     });
      //   });
      // driver.findElement(By.id('snow_profile_secondary_grain_shape'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
      // com.clickDone(sw, driver, chai);
      // driver.findElement(By.css("g.snow_profile_grain_icons image"))
      //   .then(function(image) {
      //     image.getAttribute("alt")
      //     .then(function(altAttr) {
      //       chai.expect(altAttr).to.equal("PP");
      //     });
      //   });
    });
  }); // describe('popup Primary Grain Shape operation

  /**
   * Test suite for Primary Grain Subshape operation of popup
   */
  describe('popup Primary Grain Subshape operation:', function() {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('Select stellar displays PPsd icon', async () => {
      // @todo Convert this test
      // driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
      //   .then(function() {
      //     driver.wait(function() {
      //       return driver.findElement(By.css('div#snow_profile_popup'))
      //        .isDisplayed();
      //      }, 2000, 'div#snow_profile_popup not found')
      //   })
      // .then(function() {
      //   driver.findElement(By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
      //     .then(function(elmt) {
      //       elmt.click();
      //     });
      // })
      // .then(function() {
      //   driver.findElement(By.xpath('//select[@id="snow_profile_primary_grain_subshape_PP"]/option[@value="PPsd"]'))
      //     .then(function(elmt) {
      //       elmt.click();
      //     });
      // })
      // .then(function() {
      //   com.clickDone(sw, driver, chai);
      // });
      // driver.findElement(By.css("g.snow_profile_grain_icons image"))
      //   .then(function(image) {
      //     image.getAttribute("alt")
      //     .then(function(altAttr) {
      //       chai.expect(altAttr).to.equal("PPsd");
      //     });
      //   });
    });
  }); // describe('Select stellar displays PPsd icon

  /**
   * Test suite for initialization of second popup
   */
  describe('Second popup initialization:', function() {

    beforeEach(async () => {
      // Load the test page
      await driver.get(com.testURL);
    });

    test('First popup selects a grain shape for layer 1', async () => {
      // @todo Convert this test
      // //  Popup 1 selects a primary grain shape
      // driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
      //   .then(function() {
      //     driver.wait(function() {
      //       return driver.findElement(By.css('div#snow_profile_popup'))
      //        .isDisplayed();
      //      }, 2000, 'div#snow_profile_popup not found')
      //   })
      // .then(function() {
      //   driver.findElement(By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
      //     .then(function(elmt) {
      //       elmt.click();
      //     });
      //  })
      //  .then(function() {
      //     driver.findElement(By.id('snow_profile_primary_grain_subshape_PP'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //         .then(function(displayed) {
      //           chai.expect(displayed).to.be.true;
      //         });
      //       });
      //  })
      //  .then(function() {
      //     driver.findElement(By.id('snow_profile_secondary_grain_shape'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //         .then(function(displayed) {
      //           chai.expect(displayed).to.be.true;
      //         });
      //       });
      //     })
      //  .then(function() {
      //    //  Popup 1 done
      //    com.clickDone(sw, driver, chai);
      //  })
      //  .then(function() {
      //     driver.findElement(By.css("g.snow_profile_grain_icons image"))
      //       .then(function(image) {
      //         image.getAttribute("alt")
      //         .then(function(altAttr) {
      //           chai.expect(altAttr).to.equal("PP");
      //         });
      //       });
      //     });
    });

    test('Open second popup', async () => {
      // @todo Convert this test
      // driver.executeScript(
      //   "$('use.snow_profile_button_edit:nth-of-type(2)').click()")
      //   .then(function() {
      //     driver.findElement(By.id('snow_profile_popup'))
      //       .then(function(promise) {
      //         promise.isDisplayed()
      //         .then(function(displayed) {
      //           chai.expect(displayed).to.be.true;
      //       });
      //     });
      //   });
    });

    test('Primary Grain Shape selector is visible', function() {
      // @todo Convert this test
      // //    Verify correct initialization
      // driver.findElement(By.id('snow_profile_primary_grain_shape'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });

    test('Primary Grain Subshape selector not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_primary_grain_subshape_PP'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Secondary Grain Shape selector is not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_secondary_grain_shape'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Secondary Grain Subshape selector not visible', async () => {
      // @todo Convert this test
      // driver.findElement(By.id('snow_profile_secondary_grain_subshape_PP'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.false;
      //     });
      //   });
    });

    test('Grain Size selector is visible', async () => {
      // driver.findElement(By.id('snow_profile_grain_size'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });

    test('Comment field is visible', async () => {
      // driver.findElement(By.id('snow_profile_comment'))
      //   .then(function(promise) {
      //     promise.isDisplayed()
      //     .then(function(displayed) {
      //       chai.expect(displayed).to.be.true;
      //     });
      //   });
    });
  })

  // When done, kill the browser
  afterAll(async () => {
    await driver.quit();
  }); // afterAll(

}); // decribe('Snow Profile diagram popups'

// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
