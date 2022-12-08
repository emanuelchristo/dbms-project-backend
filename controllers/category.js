async function category(req, res) {
	try {
		let { sort, location, page, type } = req.query
		location.latitude = Number(location.latitude)
		location.longitude = Number(location.longitude)
		page = parseInt(page)

		let query = `SELECT * FROM spots WHERE type='${type}';`

		if (sort == 'nearest')
			query = `SELECT * FROM spots WHERE type='${type}' ORDER BY ST_Distance_Sphere(point(${location.longitude}, ${location.latitude}), point(spots.longitude,spots.latitude));`
		else if (sort == 'rating')
			query = `SELECT * FROM spots WHERE type='${type}' ORDER BY (0.75*google_rating + 0.25*IF(user_rating, user_rating, google_rating)) DESC;`

		let rows = await req.db.query(query)
		res.json(rows)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { category }
