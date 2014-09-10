var sw = require('../node_modules/selenium-webdriver'),
  common = require('./lib'),
  chai = require("chai"),
  chaiWebdriver = require('chai-webdriver'),
  test = require('../node_modules/selenium-webdriver/testing'),
  driver,
  SnowProfile = {};

// Snow Profile test suite
test.describe('Snow Profile', function() {

  // Test the reference grid
  test.describe('reference grid', function() {
    var depthLabels = [],
      hardnessLabels = [];
    test.before(function() {
      driver = new sw.Builder()
	.withCapabilities(sw.Capabilities.chrome())
	.build();
      chai.use(chaiWebdriver(driver));

      // Load the test page
      driver.get(common.testURL);

      // Get configuration SnowProfile.Cfg from the page JS
      driver.executeScript('return window.SnowProfile.Cfg')
        .then(function(done) {
          SnowProfile.Cfg = done;
        });
    });  // test.before(

    test.it('page should have one <svg> element', function() {
      chai.expect('#snow_profile_diagram svg').dom.to.have.count(1);
    });
    test.it('page should have a reference depth selector', function() {
      chai.expect('#snow_profile_ref_depth').dom.to.have.count(1);
    });
    test.it('the reference depth selector should not be shown', function() {
      chai.expect('#snow_profile_ref_depth')
        .dom.to.have.style('display', 'none');
    });
    test.it('Depth (cm) label should exist', function() {

      // Read the depth scale text elements into depthLabels[]
      driver.findElements(
        sw.By.css('#snow_profile_diagram svg text.snow_profile_depth'))
        .then(function(done) {
          done.forEach(function(v, i) {
            done[i].getText().then(function(done) {
              depthLabels.push(done);
            });
          });
        })
        .then(function(done) {
          chai.expect(depthLabels).to.include('Depth (cm)');
        });
    });
    test.it('Hardness scale labels should exist', function() {

      // Read the hardness scale text elements into depthLabels[]
      driver.findElements(
        sw.By.css('#snow_profile_diagram svg text.snow_profile_hardness'))
        .then(function(done) {
          done.forEach(function(v, i) {
            done[i].getText().then(function(done) {
              hardnessLabels.push(done);
            });
          });
        })
        .then(function(done) {
          chai.expect(hardnessLabels).to.include('F');
          chai.expect(hardnessLabels).to.include('4F');
          chai.expect(hardnessLabels).to.include('1F');
          chai.expect(hardnessLabels).to.include('P');
          chai.expect(hardnessLabels).to.include('K');
          chai.expect(hardnessLabels).to.include('I');
          chai.expect(hardnessLabels).to.include('Hand Hardness');
        });
    });
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
