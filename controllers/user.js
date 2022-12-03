const bcrypt = require('bcrypt')
const uuid = require('uuid').v4

async function getUser(req, res) {
	try {
		const { authorization: authToken } = req.headers

		if (!authToken) {
			res.status(400).json({ error: 'Auth token required' })
			return
		}

		let rows = await req.db.query(`SELECT * FROM users WHERE auth_token="${authToken}";`)

		if (rows.length == 0) {
			res.status(404).json({ error: 'User not found' })
			return
		}

		const { user_id: userId, name, email, auth_expiry: authExpiry } = rows[0]

		res.json({ userId, name, email, authToken, authExpiry })
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function signIn(req, res) {
	try {
		const { email, password } = req.body
		// Signin with password
		if (!password || !email) {
			res.status(400).json({ error: 'Password and email required' })
			return
		}

		let rows = await req.db.query(`SELECT * FROM users WHERE email="${email}"`)
		if (rows.length == 0) {
			res.status(401).json({ error: 'Email not found' })
			return
		}

		const { user_id: userId, name, password_hash: passwordHash } = rows[0]

		// If password doesnt match
		if (!bcrypt.compareSync(password, passwordHash)) {
			res.status(401).json({ error: 'Invalid password' })
			return
		}

		const authToken = uuid()
		let authExpiry = new Date()
		authExpiry.setMinutes(authExpiry.getMinutes() + parseInt(process.env.AUTH_EXPIRY_MINUTES))

		rows = await req.db.query(
			`UPDATE users SET auth_token="${authToken}", auth_expiry="${authExpiry.toJSON()}" WHERE email="${email}";`
		)

		res.json({ userId, name, email, authToken, authExpiry })
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function signOut(req, res) {
	try {
		const { email } = req.body

		if (!email) {
			res.status(400).json({ error: 'Email required' })
			return
		}

		let rows = req.db.query(`UPDATE users SET auth_token=NULL, auth_expiry=NULL WHERE email="${email}";`)

		res.json({ success: 'Signed out' })
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function signUp(req, res) {
	try {
		const { name, email, password } = req.body

		// Checking if account with given email already exists
		let rows = await req.db.query(`SELECT * FROM users WHERE email = "${email}";`)

		if (rows.length > 0) {
			res.status(405).json({ error: 'Account with given email already exists' })
			return
		}

		const passwordHash = bcrypt.hashSync(password, 10)
		const authToken = uuid()
		let authExpiry = new Date()
		authExpiry.setMinutes(authExpiry.getMinutes() + parseInt(process.env.AUTH_EXPIRY_MINUTES))

		let result = await req.db.query(
			`INSERT INTO users (name, email, password_hash, salt, auth_token, auth_expiry) 
           VALUES ("${name}", "${email}", "${passwordHash}", "",  "${authToken}", "${authExpiry.toJSON()}");`
		)

		res.json({ userId: result.insertId, name, email, authToken, authExpiry })
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

async function getUserSpotDetails(req, res) {
	try {
		const { spotId } = req.query
		const { user_id } = req.user

		const result = {
			favourite: false,
			wantToGo: false,
		}

		let rows = await req.db.query(`SELECT * FROM fav_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		if (rows.length > 0) result.favourite = true

		rows = await req.db.query(`SELECT * FROM wtg_spots WHERE user_id=${user_id} AND spot_id=${spotId};`)
		if (rows.length > 0) result.wantToGo = true

		res.json(result)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { getUser, signIn, signOut, signUp, getUserSpotDetails }
