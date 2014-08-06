angular.module('linkedtv').factory('imageService', [function(){
	
	function getThumbnail(thumbBaseUrl, resourceUri, millis) {
		if (!thumbBaseUrl) {
			return '/image?ms=' + millis + '&id=' + resourceUri;
		}
		var h = m = s = 0;
		while (millis >= 3600000) {
			h ++;
            millis -= 3600000;
		}
        while (millis >= 60000) {
            m ++;
            millis -= 60000;
        }
        while (millis >= 1000) {
            s++;        
            millis -= 1000;
        }
        var url = thumbBaseUrl;
        url += 'h/' + h + '/m/' + m + '/sec' + s + '.jpg';
        return url;
	}

	return {
		getThumbnail : getThumbnail
	}

}]);