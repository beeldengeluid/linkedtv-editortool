Installation
===========

This file shows the installations for setting up a proper work environment.

`YOUR_INSTALL_DIR` means the directory you have cloned this project including the `linkedtv-editortool` folder (which name you might have changed locally)


Compass
--------------

```
sudo gem update --system

sudo gem install compass
```

Grunt
--------------

```
sudo npm install -g grunt-cli
sudo npm install -g grunt-init
```

Create a `package.json` file and copy it to the [YOUR_INSTALL_DIR]/web directory

```
npm init
```

Install grunt modules (in the same dir as package.json)

(Read: https://github.com/gruntjs/grunt-contrib-concat)

```
sudo npm install grunt-contrib-concat --save-dev

sudo npm install grunt-contrib-uglify --save-dev
```


Bower
--------------

```
sudo npm install -g bower
```


Install with Bower
--------------

```
bower install angular#1.2.20

bower install bootstrap

bower install underscore
```


Getting Bootstrap SASS with glyphicons to work
--------------

Check the file /css/sass/_bootstrap-overrides.scss and make sure the icon path is set correctly:

```
$icon-font-path: "../bower_components/bootstrap-sass-official/assets/fonts/bootstrap/" !default;
```

Redis
--------------

[Download](http://redis.io/download) the latest Redis package from redis.io and follow the installation instructions on the same page



Django settings
--------------

Make sure the settings.py is according to your local environment:

```
TEMPLATE_BASE = '/Users/you/workspace/linkedtv-editortool/web'
LABS_BASE = '/Users/you/workspace/linkedtv-editortool/src'

...

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'linkedtv',
        'USER': 'linkedtv',
        'PASSWORD': 'yourpassword',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

...

STATIC_URL = '/site_media/'

```

Note: when hooking up Django to Apache, make sure the STATIC_URL matches the static Apache path defined in the Apache (virtual host)config [see HOWTO.md](https://github.com/beeldengeluid/linkedtv-editortool/blob/master/docs/HOWTO.md)


Django users
--------------

Before running it you have to create at least one Django user.

Go into the python shell:

```
import os
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"
from django.contrib.auth.models import User, Group
user = User.objects.create_user('YOURUSER', 'YOUREMAIL', 'YOURPASSWORD')
user.save()
```


create an organization/group and add your user to it

```
mygroup, created = Group.objects.get_or_create(name='YOURGROUP')
user.groups.add(mygroup)
```
