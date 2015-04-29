How to work on the tool
===========


Run compass
-------------

In order to automaticcaly compile the SASS files in the [YOUR_INSTALL_DIR]/web/css/sass directory make sure to run Compass:

<code>
cd [YOUR_INSTALL_DIR]/web
</code>

<code>
compass watch
</code>

Whenever you change a .scss file the file [YOUR_INSTALL_DIR]/web/css/linkedtv-et.css, which is included in each HTML file will be updated.


Building / concatenating JavaScript
-------------

Since the site is build in Angular.JS with many separate JavaScript files, a grunt script for concatenating all custom JS files into a single file makes it easy to  include all javascript in one go by including [YOUR_INSTALL_DIR]/web/js/dist/app.concatenated.js

So whenever you have edited a JS file within [YOUR_INSTALL_DIR]/web/js, please run the following command in [YOUR_INSTALL_DIR]/web:

<code>
grunt concat
</code>