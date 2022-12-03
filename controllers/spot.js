async function spot(req, res) {
	try {
		const { spotId } = req.query
		let rows = await req.db.query(`SELECT * FROM spots WHERE spot_id=${spotId};`)
		if (rows.length == 0) {
			res.sendStatus(404).json({ error: 'Spot not found' })
			return
		}
		res.json(rows[0])
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

function submitReview(req, res) {}

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

module.exports = { spot, submitReview, markFavourite, markWantToGo }
