Installation
===========

This file shows the installations for setting up a proper work environment.


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

-* create a package.json file and copy it to the [linkedtv-et-v2]/web directory *-

```
npm init
```

-* install grunt modules (in the same dir as package.json) *-

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


Create users with Django
--------------


go into the python shell:

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
