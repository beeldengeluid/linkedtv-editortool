//TODO make sure to have a programme specific config options in a nice way
var config = angular.module('configuration', [])
       .constant('languageMap', {'rbb' : 'de', 'sv' : 'nl'})
       .constant('chapterSlotsMap', {'rbb' : 8, 'sv' : 6})