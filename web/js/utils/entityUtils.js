angular.module('linkedtv').factory('entityUtils', ['entityCollection', 'chapterCollection', 
	function(entityCollection, chapterCollection) {


	function getConfidenceClass(entity) {
		var c = parseFloat(entity.confidence);
		if(c <= 0) {
			return 'verylow';
		} else if (c > 0 && c <= 0.2) {
			return 'low';
		} else if (c > 0.2 && c <= 0.4) {
			return 'fair';
		} else if (c > 0.4 && c <= 0.6) {
			return 'medium';
		} else if (c > 0.6 && c <= 0.8) {
			return 'high';
		} else if (c > 0.8) {
			return 'veryhigh';
		}
	};


	//FIXME see if this is still necessary. Remove it from this file anyway
	function copyInformationCardTemplate(template, type) {
		console.debug('What is this? ' + type);
		if(!template) {
			return null;
		}
		var t = {};
		t.label = template.label;
		t.properties = [];
		_.each(template.properties, function(p) {
			var val = null;
			if(p.value != null && typeof(p.value) == 'object') {
				val = {'category': p.value.category, 'label': p.value.label, 'type' :p.value.type, 'uri': p.value.uri};				
			} else {
				val = p.value;
			}
			t.properties.push({'key' : p.key, 'type' : p.type, 'optional' : p.optional, 'value' : val});
		});
		return t;
	}

	return {
		getConfidenceClass : getConfidenceClass,
		copyInformationCardTemplate : copyInformationCardTemplate
	}
}]);