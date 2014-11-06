from linkedtv.model import *

class DataConverter():	

	@staticmethod
	def convertSaveData(saveData):
		if not saveData or not saveData.has_key('uri'):
			return None
		mr = MediaResource(saveData['uri'])
		if saveData.has_key('chapters'):
			chapters = []
			for c in saveData['chapters']:
				chapter = Chapter(
					c['label'], 
					c['start'], 
					c['end'],
				)
				if c.has_key('type'):
					chapter.setType(c['type']);
				if c.has_key('mfURI'):
					chapter.setMfURI(c['mfURI']),
				if c.has_key('annotationURI'):
					chapter.setAnnotationURI(c['annotationURI']),
				if c.has_key('bodyURI'):
					chapter.setBodyURI(c['bodyURI']),
				if c.has_key('relevance'):
					chapter.setRelevance(c['relevance']),
				if c.has_key('confidence'):
					chapter.setConfidence(c['confidence']),
				if c.has_key('poster'):
					chapter.setPoster(c['poster'])
				if c.has_key('dimensions'):
					dimensions = {}
					for key in c['dimensions']:
						print c['dimensions'][key]
						dimension = Dimension(
							key, #id
							c['dimensions'][key]['label'], #label
							c['dimensions'][key]['service'] #service (including id and params)
						)
						#fill the list of Enrichment objects and add it as annotations for the Dimension object
						annotations = []
						"""
						"$$hashKey":"07H", ---> TODO remove in the client
						"description":"No description",
						"entitySource":"rotterdam", ---> TODO change this to entities in the client!!!!
						"poster":"http://fotothek.slub-dresden.de/thumbs/df_hauptkatalog_0087678.jpg",
						"uri":"http://data.europeana.eu/item/01004/17D098123E29E7EFAC2C7A0003029C07DA4A3978",
						"label":"Kallmorgen, Friedrich, Rotterdamer Hafen",
						"source":"Europeana"
						"""
						if c['dimensions'][key].has_key('annotations'):
							for e in c['dimensions'][key]['annotations']:
								#mandatory fields first (TODO make sure these are always present in the client!!)
								annotation = Enrichment(e['label'])
								if e.has_key('uri'):
									annotation.setUri(e['uri'])
								if e.has_key('poster'):
									annotation.setPoster(e['poster'])
																	
								#add the optional properties
								if e.has_key('start'):
									annotation.setStart(e['start'])
								if e.has_key('end'):
									annotation.setEnd(e['end'])
								if e.has_key('source'):
									annotation.setSource(e['source'])
								if e.has_key('creator'):
									annotation.setCreator(e['creator'])
								if e.has_key('date'):
									annotation.setDate(e['date'])
								if e.has_key('entities'):
									annotation.setEntities(e['entities'])
								if e.has_key('socialInteraction'):
									annotation.setSocialInteraction(e['socialInteraction'])
								if e.has_key('mfURI'):
									annotation.setMfURI(e['mfURI'])
								if e.has_key('annotationURI'):
									annotation.setAnnotationURI(e['annotationURI'])
								if e.has_key('bodyURI'):
									annotation.setBodyURI(e['bodyURI'])
								if e.has_key('DCType'):
									annotation.setDCType(e['DCType'])

								#add the annotation to the list
								annotations.append(annotation)

						#add the annotations to the dimension
						dimension.setAnnotations(annotations)

						#add the dimension to the list
						dimensions[key] = dimension

					#add the dimensions to the chapter	
					chapter.setDimensions(dimensions)

				#add the chapter to the list
				chapters.append(chapter)

			#add the chapters to the mediaresource
			mr.setChapters(chapters)
		
		return mr