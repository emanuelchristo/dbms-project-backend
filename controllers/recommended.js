const dedupe = require('dedupe')
const shuffle = require('shuffle-array')

async function recommended(req, res) {
	try {
		const { authToken, location } = req.body

		if (!location) return

		let user = null
		let rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)
		if (rows.length > 0) user = rows[0]

		let viewBased = []
		if (user)
			viewBased = await req.db.query(
				`SELECT 
			*, (0.75*google_rating + 0.25*IF(user_rating, user_rating, google_rating)) AS net_rating,
			ST_Distance_Sphere(point(${location.longitude}, ${location.latitude}), point(spots.longitude,spots.latitude)) AS distance
			FROM spots JOIN views 
			ON spots.spot_id = views.spot_id AND views.user_id=${user?.user_id}
			ORDER BY view_count*net_rating/distance DESC LIMIT 15;`
			)

		let ratingBased = await req.db.query(`SELECT 
		*, (0.75*google_rating + 0.25*IF(user_rating, user_rating, google_rating)) AS net_rating,
		ST_Distance_Sphere(point(${location.longitude}, ${location.latitude}), point(spots.longitude,spots.latitude)) AS distance
		FROM spots
		ORDER BY net_rating DESC, distance ASC LIMIT 15;`)

		let distanceBased = await req.db.query(`SELECT 
		*, (0.75*google_rating + 0.25*IF(user_rating, user_rating, google_rating)) AS net_rating,
		ST_Distance_Sphere(point(${location.longitude}, ${location.latitude}), point(spots.longitude,spots.latitude)) AS distance
		FROM spots
		ORDER BY distance ASC, net_rating DESC LIMIT 15;`)

		let combined = [...viewBased, ...ratingBased, ...distanceBased]
		const unique = dedupe(combined, (value) => value.spot_id)

		let indexes = []
		for (let i = 0; i < unique.length; i++) indexes.push(i)
		shuffle(indexes)

		let data = []
		let count = 1
		for (let i of indexes) {
			if (count > 15) break
			data.push(unique[i])
			count += 1
		}

		res.send(data)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { recommended }
