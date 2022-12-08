const { updateSpotRating } = require('../utils/spot-rating')

const NEARBY_DISTANCE_THRESHOLD = 20000

async function spot(req, res) {
	try {
		const { spotId } = req.query
		let rows = await req.db.query(`SELECT * FROM spots WHERE spot_id=${spotId};`)
		if (rows.length == 0) {
			res.sendStatus(404).json({ error: 'Spot not found' })
			return
		}
		const spot = rows[0]

		let user = null
		const { authorization: authToken } = req.headers
		if (authToken) {
			rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)
			if (rows.length > 0) user = rows[0]
		}

		// Updating view count of user on this place
		if (user) {
			let temp = await req.db.query(`SELECT * FROM views WHERE spot_id=${spotId} AND user_id=${user.user_id};`)
			let count = temp[0]?.view_count || 0
			// If no entry yet
			if (temp.length == 0) {
				await req.db.query(
					`INSERT INTO views (user_id, spot_id, view_count) VALUES (${user.user_id}, ${spotId}, 1);`
				)
			} else {
				await req.db.query(
					`UPDATE views SET view_count=${count + 1} WHERE user_id=${user.user_id} AND spot_id=${spotId};`
				)
			}
		}

		// Getting spot images
		let images = await req.db.query(`SELECT * FROM images WHERE spot_id=${spotId};`)
		images = images.map((item) => item.file_name)
		spot.images = images

		// Getting all reviews
		let reviews = await req.db.query(
			`SELECT review_id, spot_id, reviews.user_id, description, rating, name as username FROM reviews JOIN users ON reviews.user_id = users.user_id WHERE spot_id=${spotId} ORDER BY RAND() LIMIT 10;`
		)

		// Checking if signed in user has a review on this spot
		if (user) {
			rows = await req.db.query(`SELECT * FROM reviews WHERE spot_id=${spotId} AND user_id=${user.user_id};`)
			if (rows.length > 0) {
				const currUserReview = rows[0]
				currUserReview.username = user?.name
				// Removing curr users's review from reviews if it exists (avoid duplicate)
				reviews = reviews.filter((item) => item.review_id != currUserReview.review_id)
				spot.currUserReview = currUserReview
			}
		}

		// Adding reviews to spot
		spot.reviews = reviews

		// Nearby spots
		rows = await req.db.query(
			`SELECT * FROM spots WHERE spot_id <> ${spotId} AND ST_Distance_Sphere(point(${spot.longitude}, ${spot.latitude}), point(spots.longitude,spots.latitude)) < ${NEARBY_DISTANCE_THRESHOLD} ORDER BY ST_Distance_Sphere(point(${spot.longitude}, ${spot.latitude}), point(spots.longitude,spots.latitude)) LIMIT 10;`
		)
		spot.nearBySpots = rows

		res.json(spot)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function submitReview(req, res) {
	try {
		const { review, spotId } = req.body
		if (!review || !spotId) {
			res.status(400).json({ error: 'Review and spot id required' })
			return
		}

		const { user_id } = req.user

		// Checking if user already has a review in the given spot - only one review per user for a spot
		let rows = await req.db.query(`SELECT * FROM reviews WHERE user_id=${user_id} AND spot_id=${spotId};`)
		if (rows.length > 0) {
			res.status(400).json({ error: 'User already has a review for the spot' })
			return
		}

		await req.db.query(
			`INSERT INTO reviews (spot_id, user_id, description, rating) VALUES (${spotId}, ${user_id}, "${review?.description}", ${review?.rating});`
		)

		await updateSpotRating({ db: req.db, spotId })

		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function editReview(req, res) {
	try {
		const { review, reviewId } = req.body
		if (!review || !reviewId) {
			res.status(400).json({ error: 'Review and review id required' })
			return
		}

		const { user_id } = req.user

		await req.db.query(
			`UPDATE reviews SET description="${review?.description}", rating=${review?.rating} WHERE user_id=${user_id} AND review_id=${reviewId};`
		)

		let spotId = await req.db.query(`SELECT spot_id FROM reviews WHERE review_id=${reviewId};`)
		spotId = spotId[0].spot_id

		await updateSpotRating({ db: req.db, spotId })

		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function deleteReview(req, res) {
	try {
		const { reviewId } = req.body
		if (!reviewId) {
			res.status(400).json({ error: 'Review id required' })
			return
		}

		const { user_id } = req.user

		let spotId = await req.db.query(`SELECT spot_id FROM reviews WHERE review_id=${reviewId};`)
		spotId = spotId[0].spot_id

		await req.db.query(`DELETE FROM reviews WHERE review_id=${reviewId} AND user_id=${user_id};`)

		await updateSpotRating({ db: req.db, spotId })

		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function markFavourite(req, res) {
	try {
		const { spotId, favourite } = req.body
		const { user_id } = req.user

		let currFavouriteStatus = false
		let rows = await req.db.query(`SELECT * FROM fav_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		if (rows.length > 0) currFavouriteStatus = true

		if (currFavouriteStatus == favourite) {
			res.sendStatus(200)
			return
		}

		if (favourite === false)
			await req.db.query(`DELETE FROM fav_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		else await req.db.query(`INSERT INTO fav_spots VALUES(${user_id}, ${spotId});`)

		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function markWantToGo(req, res) {
	try {
		const { spotId, wantToGo } = req.body
		const { user_id } = req.user

		let currWantToGoStatus = false
		let rows = await req.db.query(`SELECT * FROM wtg_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		if (rows.length > 0) currWantToGoStatus = true

		if (currWantToGoStatus == wantToGo) {
			res.sendStatus(200)
			return
		}

		if (wantToGo === false)
			await req.db.query(`DELETE FROM wtg_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		else await req.db.query(`INSERT INTO wtg_spots VALUES(${user_id}, ${spotId});`)

		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { spot, submitReview, editReview, deleteReview, markFavourite, markWantToGo }
