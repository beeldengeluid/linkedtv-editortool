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
					c['mfURI'], 
					c['annotationURI'], 
					c['bodyURI'],
					c['relevance'],
					c['confidence'],
					c['poster']
				)				
				if c.has_key('dimensions'):		
					dimensions = []			
					for key in c['dimensions']:						
						dimension = Dimension(
							key, #id
							key #for now also use the id for the description
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
						for e in c['dimensions'][key]:
							#mandatory fields first (TODO make sure these are always present in the client!!)
							annotation = Enrichment(
								e['uri'],#TODO change to url in client!
								e['label'],
								e['poster']
							)
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
							if e.has_key('bodyURI'):
								annotation.setBodyURI(e['bodyURI'])
							if e.has_key('DCType'):
								annotation.setDCType(e['DCType'])

							#add the annotation to the list
							annotations.append(annotation)

						#add the annotations to the dimension
						dimension.setAnnotations(annotations)

						#add the dimension to the list
						dimensions.append(dimension)

					#add the dimensions to the chapter	
					chapter.setDimensions(dimensions)

				#add the chapter to the list
				chapters.append(chapter)

			#add the chapters to the mediaresource
			mr.setChapters(chapters)
		
		return mr