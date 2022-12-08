async function updateSpotRating({ db, spotId }) {
	let rows = await db.query(`SELECT AVG(rating) AS rating FROM reviews WHERE spot_id=${spotId};`)
	let rating = rows[0].rating
	await db.query(`UPDATE spots SET user_rating=${rating} WHERE spot_id=${spotId};`)
	return
}

module.exports = { updateSpotRating }
