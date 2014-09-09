var sw = require('../node_modules/selenium-webdriver'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');

var baseURL = 'file:///home/haas/Dropbox/uac/snow_profile/';
var testURL = baseURL + "snow_profile.html";
var SnowProfile = {};

// Snow Profile test suite
test.describe('Snow Profile', function() {
  var driver;

  // Test the reference grid
  test.describe('reference grid', function() {
    var depthLabels = [];
    test.before(function() {
      driver = new sw.Builder()
	.withCapabilities(sw.Capabilities.chrome())
	.build();
      chai.use(chaiWebdriver(driver));
      driver.get(testURL);

      // Get configuration from the page JS
      driver.executeScript('return window.SnowProfile.Cfg');

      // Read the depth scale text elements into depthLabels[]
      driver.findElements(
        sw.By.css('#snow_profile_diagram svg text.snow_profile_depth'))
        .then(function(done) {
          done.forEach(function(v, i) {
            done[i].getText().then(function(done) {
              depthLabels.push(done);
            });
          });
        });
    });  // test.before(

    test.it('page should have one <svg> element', function() {
      chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
    });
    test.it('page should have a reference depth selector', function() {
      chai.expect('#snow_profile_ref_depth').dom.to.have.count(1);
    });
    test.it('the reference depth selector should not be shown', function() {
      chai.expect('#snow_profile_ref_depth').dom.to.have.style('display', 'none');
    });
    test.it('Depth (cm) label should exist', function() {
      chai.expect(depthLabels).to.include('Depth (cm)');
    });
    // test.it('Hand Hardness label should exist', function() {
    //   chai.expect('#snow_profile_diagram svg text.snow_profile_hardness')
    //     .dom.to.have.text('Hand Hardness');
    // });
  }); // test.decribe('reference grid

//  test.describe('handles', function() {

//  });

  test.after(function() {
    driver.quit();
  });

});

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
