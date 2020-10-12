/**
 * @file Mocha tests for the popups
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

var sw = require('../node_modules/selenium-webdriver'),
  com = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver')
  var SnowProfile = {},
    driver;

// Test the popups
describe('Popup:', function() {

  /**
   * Initialize, load the test page and read
   * the static configuration variables from the page JS
   */
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
  });  // before(

  /**
   * Test suite for initial conditions of a fresh page
   */
  describe('popup page initial conditions:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('right initial number of buttons', function() {
      driver.findElements(sw.By.css('use'))
        .then(function(done) {
          chai.expect(done.length).to.equal(2 * SnowProfile.Cfg.NUM_INIT_LAYERS);
        });
    });

    it('popup is not displayed', function() {
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });

  });  // describe('page initial conditions

  /**
   * Test suite for initial conditions of popup
   */
  describe('popup initial conditions:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('click on edit button creates popup', function() {
      driver.executeScript(
        "$('use.snow_profile_button_edit:nth-of-type(2)').click()")
        .then(function() {
          driver.findElement(sw.By.id('snow_profile_popup'))
            .then(function(promise) {
              promise.isDisplayed()
              .then(function(displayed) {
                chai.expect(displayed).to.be.true;
            });
          });
        });
    });
    it('Primary Grain Shape selector is visible', function() {
      driver.findElement(sw.By.id('snow_profile_primary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    it('Primary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Secondary Grain Shape selector is not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Secondary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Grain Size selector is visible', function() {
      driver.findElement(sw.By.id('snow_profile_grain_size'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    it('Comment field is visible', function() {
      driver.findElement(sw.By.id('snow_profile_comment'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
  });  // describe('popup initial conditions

  /**
   * Test suite for "Cancel" button operation of popup
   */
  describe('popup "Cancel" button operation:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('click on edit button creates popup', function() {
      driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
        .then(function() {
          driver.wait(function() {
            return driver.findElement(sw.By.css('div#snow_profile_popup'))
             .isDisplayed();
           }, 2000, 'div#snow_profile_popup not found')
        })
        .then(function() {
          driver.findElement(sw.By.id('snow_profile_popup'))
            .then(function(promise) {
              promise.isDisplayed()
              .then(function(displayed) {
                chai.expect(displayed).to.be.true;
              });
            });
        });
    });
    it('Cancel button dismisses popup', function() {
      driver.findElement(sw.By.xpath('//button[.="Cancel"]'))
        .then(function(elmt) {
          elmt.click();
        });
    });
    it('popup no longer displayed', function() {
      driver.findElement(sw.By.id('snow_profile_popup'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
  });  // describe('popup "Cancel" button operation

  /**
   * Test suite for Primary Grain Shape operation of popup
   */
  describe('popup Primary Grain Shape operation:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('Select Primary Grain Shape PP displays PP icon', function() {
      driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
        .then(function() {
          driver.wait(function() {
            return driver.findElement(sw.By.css('div#snow_profile_popup'))
             .isDisplayed();
           }, 2000, 'div#snow_profile_popup not found')
        })
        .then(function() {
          driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
          .then(function(elmt) {
            elmt.click();
          })
        })
        .then(function() {
          driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
            .then(function(promise) {
              promise.isDisplayed()
                .then(function(displayed) {
                  chai.expect(displayed).to.be.true;
            })
          });
        });
      driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
      com.clickDone(sw, driver, chai);
      driver.findElement(sw.By.css("g.snow_profile_grain_icons image"))
        .then(function(image) {
          image.getAttribute("alt")
          .then(function(altAttr) {
            chai.expect(altAttr).to.equal("PP");
          });
        });
    });
  }); // describe('popup Primary Grain Shape operation

  /**
   * Test suite for Primary Grain Subshape operation of popup
   */
  describe('popup Primary Grain Subshape operation:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('Select stellar displays PPsd icon', function() {
      driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
        .then(function() {
          driver.wait(function() {
            return driver.findElement(sw.By.css('div#snow_profile_popup'))
             .isDisplayed();
           }, 2000, 'div#snow_profile_popup not found')
        })
      .then(function() {
        driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
          .then(function(elmt) {
            elmt.click();
          });
      })
      .then(function() {
        driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_PP"]/option[@value="PPsd"]'))
          .then(function(elmt) {
            elmt.click();
          });
      })
      .then(function() {
        com.clickDone(sw, driver, chai);
      });
      driver.findElement(sw.By.css("g.snow_profile_grain_icons image"))
        .then(function(image) {
          image.getAttribute("alt")
          .then(function(altAttr) {
            chai.expect(altAttr).to.equal("PPsd");
          });
        });
    });
  }); // describe('Select stellar displays PPsd icon

  /**
   * Test suite for initialization of second popup
   */
  describe('Second popup initialization:', function() {

    before(function() {
      // Load the test page
      driver.get(com.testURL);
    });

    it('First popup selects a grain shape for layer 1', function() {
      //  Popup 1 selects a primary grain shape
      driver.executeScript("$('use.snow_profile_button_edit:nth-of-type(1)').click()")
        .then(function() {
          driver.wait(function() {
            return driver.findElement(sw.By.css('div#snow_profile_popup'))
             .isDisplayed();
           }, 2000, 'div#snow_profile_popup not found')
        })
      .then(function() {
        driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="PP"]'))
          .then(function(elmt) {
            elmt.click();
          });
       })
       .then(function() {
          driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
            .then(function(promise) {
              promise.isDisplayed()
              .then(function(displayed) {
                chai.expect(displayed).to.be.true;
              });
            });
       })
       .then(function() {
          driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
            .then(function(promise) {
              promise.isDisplayed()
              .then(function(displayed) {
                chai.expect(displayed).to.be.true;
              });
            });
          })
       .then(function() {
         //  Popup 1 done
         com.clickDone(sw, driver, chai);
       })
       .then(function() {
          driver.findElement(sw.By.css("g.snow_profile_grain_icons image"))
            .then(function(image) {
              image.getAttribute("alt")
              .then(function(altAttr) {
                chai.expect(altAttr).to.equal("PP");
              });
            });
          });
    });

    it('Open second popup', function() {
      driver.executeScript(
        "$('use.snow_profile_button_edit:nth-of-type(2)').click()")
        .then(function() {
          driver.findElement(sw.By.id('snow_profile_popup'))
            .then(function(promise) {
              promise.isDisplayed()
              .then(function(displayed) {
                chai.expect(displayed).to.be.true;
            });
          });
        });
    });
    it('Primary Grain Shape selector is visible', function() {
      //    Verify correct initialization
      driver.findElement(sw.By.id('snow_profile_primary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    it('Primary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_primary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Secondary Grain Shape selector is not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_shape'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Secondary Grain Subshape selector not visible', function() {
      driver.findElement(sw.By.id('snow_profile_secondary_grain_subshape_PP'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.false;
          });
        });
    });
    it('Grain Size selector is visible', function() {
      driver.findElement(sw.By.id('snow_profile_grain_size'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
    it('Comment field is visible', function() {
      driver.findElement(sw.By.id('snow_profile_comment'))
        .then(function(promise) {
          promise.isDisplayed()
          .then(function(displayed) {
            chai.expect(displayed).to.be.true;
          });
        });
    });
  })

  // When done, kill the browser
  after(function() {
    driver.quit();
  }); // after(

}); // decribe('Snow Profile diagram popups'

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
