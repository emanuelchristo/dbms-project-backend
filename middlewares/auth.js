async function checkAuth(req, res, next) {
	try {
		const { authorization: authToken } = req.headers
		const rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)

		if (rows.length == 0) {
			res.sendStatus(401)
			return
		}

		const { auth_expiry: authExpiry, user_id: userId } = rows[0]
		if (new Date().toJSON() > authExpiry) {
			await req.db.query(`UPDATE users SET auth_token=NULL, auth_expiry=NULL WHERE user_id="${userId}";`)
			res.sendStatus(401)
			return
		}

		req.user = rows[0]

		next()
	} catch (err) {
		console.error(err)
	}
}

module.exports = { checkAuth }
