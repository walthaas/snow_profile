DEVELOPING AND TESTING JAVASCRIPT

1. Install the snow_profile_example Drupal module.

2. Install npm for your platform:
   http://nodejs.org/

3. Install the Chrome browser for your platform:
   https://www.google.com/intl/en/chrome/browser

4. Install ChromeDriver for your platform:
   https://sites.google.com/a/chromium.org/chromedriver/home

5. Install the Grunt command-line interface:
   npm install -g grunt-cli
   (this must be done as root on *nix systems)

6. In this directory:
   npm install

7. You should now be able to use grunt to lint, document and test.
   lint: This is the default grunt task.  It uses ESLint.  The configuration is
     stored in conf/eslint.json and derives from Drupal 8, but allows "alert"
     and "confirm".
   doc: Uses jsdoc 3.  HTML output is stored in doc/ .  Read it with a
     browser starting at doc/index.html .
   test: Uses Chrome with Selenium Webdriver to provide a functional test.
     The URL tested is exported by test/lib/index.js.  Edit this file to use
     the right URL for your site.  File test/lib/test.html is a static HTML
     file that tests the JavaScript without calling any Drupal functions.
     The jQuery and SVG JavaScript libraries are loaded from the normal Drupal
     directories.
