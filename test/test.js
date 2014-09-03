var sw = require('../node_modules/selenium-webdriver'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');

var baseURL = 'file:///home/haas/Dropbox/uac/snow_profile/';
var testURL = baseURL + "snow_profile.html";
var SnowProfile = {};

test.describe('Snow Profile', function() {
  var driver;

  test.describe('reference grid', function() {
    test.before(function() {
      driver = new sw.Builder()
	.withCapabilities(sw.Capabilities.chrome())
	.build();
      chai.use(chaiWebdriver(driver));
      driver.get(testURL)
        .thenFinally(function() {
          driver.executeScript('return window.SnowProfile.Cfg')
            .then(
	      function(done){
                SnowProfile.Cfg = done;
          });
          driver.findElement(sw.By.css('#snow_profile_diagram svg'))
            .getLocation()
            .then(
              function(done){
                console.info("location=", done);
          });
        });
    });

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
      chai.expect('#snow_profile_diagram svg tspan')
	.dom.to.have.text('Depth (cm)');
    });
    // test.it('Hand Hardness label should exist', function() {
    //   chai.expect('#snow_profile_diagram svg tspan')
    //     .dom.to.have.text('Hand Hardness');
    // });
  });

  test.describe('handles', function() {

  });

  test.after(function() {
    driver.quit();
  });

});
