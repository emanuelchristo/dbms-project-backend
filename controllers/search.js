const axios = require('axios')

const SEARCH_DISTANCE_THRESHOLD = 20000

async function search(req, res) {
	try {
		let { sort, location, page, type, query } = req.body
		if (type == 'all') type = '%'

		if (!query) {
			res.json({ spots: [], totalPages: 1, page: 1, totalResults: 0 })
			return
		}

		const { data } = await axios.get(
			`http://api.positionstack.com/v1/forward?access_key=${process.env.POSTITION_STACK_API_KEY}&query=${query}`
		)

		if (!data?.data?.[0]) {
			res.json({ spots: [], totalPages: 1, page: 1, totalResults: 0 })
			return
		}

		const queryLocation = data.data[0]

		let dbquery = ''
		if (sort == 'relavance')
			dbquery = `SELECT * FROM spots WHERE type LIKE '${type}' AND ST_Distance_Sphere(point(${queryLocation.longitude}, ${queryLocation.latitude}), point(spots.longitude,spots.latitude)) < ${SEARCH_DISTANCE_THRESHOLD} ORDER BY ST_Distance_Sphere(point(${queryLocation.longitude}, ${queryLocation.latitude}), point(spots.longitude,spots.latitude));`
		else if (sort == 'nearest')
			dbquery = `SELECT * FROM spots WHERE type LIKE '${type}' AND ST_Distance_Sphere(point(${queryLocation.longitude}, ${queryLocation.latitude}), point(spots.longitude,spots.latitude)) < ${SEARCH_DISTANCE_THRESHOLD} ORDER BY ST_Distance_Sphere(point(${location.longitude}, ${location.latitude}), point(spots.longitude,spots.latitude));`
		else if (sort == 'rating')
			dbquery = `SELECT * FROM spots WHERE type LIKE '${type}' AND ST_Distance_Sphere(point(${queryLocation.longitude}, ${queryLocation.latitude}), point(spots.longitude,spots.latitude)) < ${SEARCH_DISTANCE_THRESHOLD} ORDER BY (0.75*google_rating + 0.25*IF(user_rating, user_rating, google_rating)) DESC;`

		let count = await req.db.query(
			`SELECT COUNT(*) AS totalResults FROM spots WHERE type LIKE '${type}' AND ST_Distance_Sphere(point(${queryLocation.longitude}, ${queryLocation.latitude}), point(spots.longitude,spots.latitude)) < ${SEARCH_DISTANCE_THRESHOLD};`
		)
		count = count[0].totalResults

		let rows = await req.db.query(dbquery)
		res.json({ spots: rows, totalPages: 1, page: 1, totalResults: count })
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { search }
