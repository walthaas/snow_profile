/**
 * @file Common defines for Mocha tests
 * @copyright Walt Haas <haas@xmission.com>
 * @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */
exports.testURL = 'file://' + process.cwd() + '/test/lib/test.html';

/**
 * Set layer features
 *
 * @param {object} sw
 * @param {object} driver
 * @param {number} index Layer number. Top layer is zero.
 * @param {string} shape
 * @param {number} size
 * @param {string} comment
 */
exports.setFeatures = function setFeatures(sw, driver, index, shape, size,
  comment) {

  var primaryShape,
    primarySubShape,
    secondaryShape,
    secondarySubShape,
    sizeMin,
    sizeMax,
    popupDisplayed;

  // Shape is a string specifying primary shape, or an array of two
  // strings specifying primary or seconday shape.  May be null.
  if ((shape !== null) && (shape !== undefined)) {

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
  }

  // Size is a number specifying grain size, or an array of two
  // numbers specifying a range of sizes.  May be null.
  if ((size !== null) && (size !== undefined)) {
    if (Object.prototype.toString.call(size) === '[object Array]') {
      sizeMin = size[0];
      sizeMax = size[1];
    }
    else {
      sizeMin = size;
    }
    console.info('size=', sizeMin, (sizeMax !== undefined) ? (' - ' + sizeMax) : '');
  }

  // Comment is a string or null
  if ((comment !== null) && (comment !== undefined)) {
    console.info('comment=', comment);
  }

  // Click the Edit button for the layer to open the popup.
  driver.findElement(sw.By.xpath(
    "//*[name()='svg']/*[name()='g']/*[name()='g']" +
      "[@class='snow_profile_button Edit'][" + (index + 1) + "]")).click();
  driver.wait(function() {
    return driver.findElement(sw.By.css('div#snow_profile_popup')).isDisplayed();
    }, 2000, 'div#snow_profile_popup not found')
    .then(function() {
      if (primaryShape !== undefined) {

        // Set popup <select>s to shape values
        driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_shape"]/option[@value="' + primaryShape + '"]')).click();
        if (primarySubShape !== undefined) {
          driver.wait(function() {
            return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_' + primaryShape + '"]'));
            }, 2000, 'subselect for ' + primaryShape + ' not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_primary_grain_subshape_' + primaryShape + '"]/option[@value="' + primarySubShape + '"]')).click();
            });
        }
        if (secondaryShape !== undefined) {
          driver.wait(function() {
            return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_secondary_grain_select"]'));
            },
            2000, 'select secondary_grain_select not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_secondary_grain_select"]/option[@value="' + secondaryShape + '"]')).click();
              });
          if (secondarySubShape !== undefined) {
            driver.wait(function() {
              return driver.isElementPresent(sw.By.xpath('//select[@id="snow_profile_secondary_grain_subshape_' + secondaryShape + '"]'));
            },
            2000, 'select secondary_grain_subshape not found')
            .then(function() {
              driver.findElement(sw.By.xpath('//select[@id="snow_profile_secondary_grain_subshape_'+ secondaryShape +'"]/option[@value="' + secondarySubShape + '"]')).click();
              });
          }
        }
      }

      // Click the Done button to save the features
      driver.findElement(sw.By.xpath('//button[.="Done"]')).click();

      // Wait for the popup to disappear
      driver.wait(function() {
        driver.findElement(sw.By.css('div#snow_profile_popup'))
          .then(function(popup) {
            popupDisplayed = popup.isDisplayed();
          });
        return !popupDisplayed;
      }, 2000, "popup didn't go away");
    });
}





