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
					c['label']
				)
				chapter.setStart(c['start'])
				chapter.setEnd(c['end'])
				if c.has_key('type'):
					chapter.setType(c['type']);
				if c.has_key('annotationURI'):
					chapter.setAnnotationURI(c['annotationURI']),
				if c.has_key('relevance'):
					chapter.setRelevance(c['relevance']),
				if c.has_key('confidence'):
					chapter.setConfidence(c['confidence']),
				if c.has_key('poster'):
					chapter.setPoster(c['poster'])
				if c.has_key('dimensions'):
					dimensions = {}
					for key in c['dimensions']:
						print key
						print c['dimensions'][key]
						dimension = Dimension(
							key, #id
							c['dimensions'][key]['label'], #label
							c['dimensions'][key]['linkedtvDimension'],#used to create a linkedtv:dimension RDF triple
							c['dimensions'][key]['service'] #service (including id and params)
						)
						#fill the list of Enrichment objects and add it as annotations for the Dimension object
						annotations = []
						if c['dimensions'][key].has_key('annotations'):
							for e in c['dimensions'][key]['annotations']:
								#mandatory fields first (TODO make sure these are always present in the client!!)
								annotation = Enrichment(e['label'])
								if e.has_key('description'):
									annotation.setDescription(e['description'])
								if e.has_key('uri'):#only used for information cards
									annotation.setUri(e['uri'])
								if e.has_key('url'):#mandatory for regular enrichments (optional for ICs)
									annotation.setUrl(e['url'])
								if e.has_key('poster'):
									annotation.setPoster(e['poster'])

								#add the optional properties
								if e.has_key('start') and e['start']:
									annotation.setStart(e['start'])
								if e.has_key('end') and e['end']:
									annotation.setEnd(e['end'])
								if e.has_key('source'):
									annotation.setSource(e['source'])
								if e.has_key('creator'):
									annotation.setCreator(e['creator'])
								if e.has_key('date'):
									annotation.setDate(e['date'])
								if e.has_key('entities'):
									entities = []
									for ne in e['entities']:
										entity = Entity()
										if ne.has_key('uri'):#in case of a DBpedia NE (chosen by user)
											entity.setUri(ne['uri'])
										if ne.has_key('disambiguationURL'):#in case of an autogen NE
											entity.setUri(ne['disambiguationURL'])
										if ne.has_key('label'):
											entity.setLabel(ne['label'])
										if ne.has_key('type'):
											entity.setType(ne['type'])
										if ne.has_key('etURI'):
											entity.setEtURI(ne['etURI'])
										entities.append(entity)
									annotation.setEntities(entities)
								if e.has_key('annotationURI'):
									annotation.setAnnotationURI(e['annotationURI'])
								if e.has_key('enrichmentType'):
									annotation.setEnrichmentType(e['enrichmentType'])

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