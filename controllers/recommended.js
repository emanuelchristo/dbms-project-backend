async function recommended(req, res) {
	try {
		const { authToken, location: currLocation } = req.body

		let user = null
		let rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)
		if (rows.length > 0) user = rows[0]
		res.send([])
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { recommended }
