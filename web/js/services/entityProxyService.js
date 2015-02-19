angular.module('linkedtv').factory('entityProxyService', ['$rootScope', 'conf', function($rootScope, conf){


	function fetch(uri, callback) {
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + uri + '&lang=' + conf.programmeConfig.lang,
			success : function(json) {
				callback(json.error ? null : formatResponse(json));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function formatResponse(data) {
		console.debug(data);
		var info = [];
		var thumbs = [];
		for (key in data) {
			var prop = null;
			for(k in data[key]) {
				prop = data[key][k];
				var values = [];
				var uris = [];
				if(typeof(prop) == 'string') {
					values.push(prop);
					info.push({index : 0, key : k, values : values , uris : uris});
				} else if(typeof(prop) == "object") {
					if(prop.length > 0) {
						for(p in prop) {
							values.push(prop[p].value || prop[p]);
							uris.push(prop[p].uri);
						}
						if(key !== 'thumb') {
							info.push({index : 0, key : k, values : values, uris : uris});
						}
					}
				}
			}
		}
		info.sort();
		thumbs = getThumbs(info);
		return {info : info, thumbs : thumbs};
	}

	function getThumbs(info) {
		for(var i=0;i<info.length;i++) {
			if(info[i].key == 'thumb') {
				return info[i].values;
			}
		}
		return [];
	}


	return {
		fetch : fetch
	}

}]);