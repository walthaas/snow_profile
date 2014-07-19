/**
  @file Contains main program
  @copyright Walt Haas <haas@xmission.com>
  @license {@link http://www.gnu.org/licenses/old-licenses/gpl-2.0.html GPLv2}
 */

/* global SnowProfile */
/* global SVG */

/**
  @desc Main program
 */
if (SVG.supported) {
  SnowProfile.init();
  new SnowProfile.Layer(0);
  new SnowProfile.Layer(20);
  new SnowProfile.Layer(40);
} else {
  alert('Your browser does not support SVG, used by the snow profile editor');
}

// Configure Emacs for Drupal JavaScript coding standards
// Local Variables:
// js2-basic-offset: 2
// indent-tabs-mode: nil
// fill-column: 78
// show-trailing-whitespace: t
// End:
