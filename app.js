require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mysql = require('promise-mysql')

const { checkAuth } = require('./middlewares/auth')
const { getUser, signIn, signOut, signUp, getUserSpotDetails } = require('./controllers/user')
const { search } = require('./controllers/search')
const { recommended } = require('./controllers/recommended')
const { category } = require('./controllers/category')
const { favourites, wantToGo } = require('./controllers/collections')
const { spot, submitReview, markFavourite, markWantToGo } = require('./controllers/spot')
const { submitFeedback } = require('./controllers/feedback')

async function main() {
	const app = express()

	const db = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'password',
		database: 'letsgo',
	})

	// MIDDLEWARES
	app.use(cors())
	app.use(express.json())
	app.use((req, res, next) => {
		req.db = db
		next()
	})

	// ROUTES

	// User
	app.get('/get-user', checkAuth, getUser)
	app.post('/sign-in', signIn)
	app.post('/sign-out', checkAuth, signOut)
	app.post('/sign-up', signUp)
	app.get('/user-spot-details', checkAuth, getUserSpotDetails)

	// Landing page
	app.post('/search', search)
	app.get('/recommended', recommended)

	// Category pages
	app.get('/category', category)

	// Collections
	app.get('/favourites', checkAuth, favourites)
	app.get('/want-to-go', checkAuth, wantToGo)

	// Spot page
	app.get('/spot', spot)
	app.post('/mark-favourite', checkAuth, markFavourite)
	app.post('/mark-want-to-go', checkAuth, markWantToGo)
	app.post('/submit-review', checkAuth, submitReview)

	// Feedback page
	app.post('/submit-feedback', checkAuth, submitFeedback)

	const PORT = process.env.PORT || 5001
	app.listen(PORT, () => console.log(`Listening on port ${PORT} ...`))
}

main()
