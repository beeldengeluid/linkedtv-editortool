How to work on the tool
===========

Run the editor tool
------------

Start the editor tool by executing the following commands in [YOUR_INSTALL_DIR]/src:

```
python manage.py runserver [PORT]
```

You can fill in any port you like in [PORT]. If you want to run it on the HTTP port (80), you need to make sure to hook it up to e.g. Apache or nginx by using e.g. [mod_wsgi](https://code.google.com/p/modwsgi/) for Apache or [uwsgi](https://uwsgi-docs.readthedocs.org/en/latest/) for [nginx](http://nginx.org/)

Only mod_wsgi has been tested. For this e.g. use the following Apache config:

```
<VirtualHost *:80>
    ServerName your.domain.here
    ServerAdmin your@email.here

    Alias /site_media/ /var/www/linkedtv-editortool/web/

    <Directory /var/www/linkedtv-editortool/web>
        <IfVersion < 2.3 >
           Order allow,deny
           Allow from all
        </IfVersion>
        <IfVersion >= 2.3>
          Require all granted
        </IfVersion>
    </Directory>


    WSGIScriptAlias / /var/www/linkedtv-editortool/src/wsgi.py

    <Directory /var/www/linkedtv-editortool/src>
        <IfVersion < 2.3 >
          Order allow,deny
          Allow from all
        </IfVersion>
        <IfVersion >= 2.3>
          Require all granted
        </IfVersion>
    </Directory>

</VirtualHost>
```
As you can see the wsgi.py located in this project is used as a linking pin between Apache and Django.

Run compass
-------------

In order to automaticcaly compile the SASS files in the `[YOUR_INSTALL_DIR]/web/css/sass` directory make sure to run Compass:

```
cd [YOUR_INSTALL_DIR]/web
compass watch
```

Whenever you change a .scss file the file [YOUR_INSTALL_DIR]/web/css/linkedtv-et.css, which is included in each HTML file will be updated.


Building / concatenating JavaScript
-------------

Since the site is build in Angular.JS with many separate JavaScript files, a grunt script for concatenating all custom JS files into a single file makes it easy to  include all javascript in one go by including `[YOUR_INSTALL_DIR]/web/js/dist/app.concatenated.js`

So whenever you have edited a JS file within `[YOUR_INSTALL_DIR]/web/js`, please run the following command in `[YOUR_INSTALL_DIR]/web`:

```
grunt concat
```