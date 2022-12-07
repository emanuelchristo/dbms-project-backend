async function favourites(req, res) {
	try {
		const { authorization: authToken } = req.headers
		let { type, currPage } = req.query
		currPage = parseInt(currPage)
		if (type == 'all') type = '%'

		let rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)
		const { user_id: userId } = rows[0]

		rows = await req.db.query(
			`SELECT * FROM spots WHERE type LIKE "${type}" AND spot_id IN (SELECT spot_id FROM fav_spots WHERE user_id=${userId});`
		)

		res.json(rows)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function wantToGo(req, res) {
	try {
		const { authorization: authToken } = req.headers
		let { type, currPage } = req.query
		currPage = parseInt(currPage)
		if (type == 'all') type = '%'

		let rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)
		const { user_id: userId } = rows[0]

		rows = await req.db.query(
			`SELECT * FROM spots WHERE type LIKE "${type}" AND spot_id IN (SELECT spot_id FROM wtg_spots WHERE user_id=${userId});`
		)

		res.json(rows)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { favourites, wantToGo }
