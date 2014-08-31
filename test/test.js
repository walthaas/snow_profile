var sw = require('../node_modules/selenium-webdriver'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing');

var baseURL = 'file:///home/haas/Dropbox/uac/snow_profile/';

test.describe('Snow Profile', function() {
  var driver;

  test.before(function() {
    driver = new sw.Builder()
      .withCapabilities(sw.Capabilities.chrome())
      .build();
    chai.use(chaiWebdriver(driver));
  });

  test.it('should have an SVG element', function() {
    driver.get(baseURL + "snow_profile.html").then(function() {
      console.info("got");
      chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
    });
  });

  test.after(function() {
    driver.quit();
  });

});
