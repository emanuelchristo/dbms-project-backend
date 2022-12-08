require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mysql = require('promise-mysql')
const fs = require('fs')

const { checkAuth } = require('./middlewares/auth')
const {
	getUser,
	signIn,
	signOut,
	signUp,
	getUserSpotDetails,
	editName,
	getProfile,
	deleteAccount,
} = require('./controllers/user')
const { search } = require('./controllers/search')
const { recommended } = require('./controllers/recommended')
const { category } = require('./controllers/category')
const { favourites, wantToGo } = require('./controllers/collections')
const { spot, submitReview, editReview, markFavourite, markWantToGo, deleteReview } = require('./controllers/spot')
const { submitFeedback } = require('./controllers/feedback')
const { getLocationName } = require('./controllers/location')

async function main() {
	const app = express()

	// const db = await mysql.createConnection({
	// 	host: '20.219.24.151',
	// 	user: 'root',
	// 	password: 'Password@123',
	// 	database: 'letsgo',
	// })

	const db = await mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: 3306,
		ssl: { ca: fs.readFileSync(process.env.DB_CERT_FILE) },
	})

	// MIDDLEWARES
	app.use(cors())
	app.use(express.json())
	app.use((req, res, next) => {
		req.db = db
		next()
	})

	// ROUTES

	app.get('/', (req, res) => {
		res.send('Hello world')
	})

	// User
	app.get('/api/get-user', checkAuth, getUser)
	app.post('/api/sign-in', signIn)
	app.post('/api/sign-out', checkAuth, signOut)
	app.post('/api/sign-up', signUp)
	app.get('/api/user-spot-details', checkAuth, getUserSpotDetails)
	app.post('/api/edit-name', checkAuth, editName)
	app.get('/api/get-profile', checkAuth, getProfile)
	app.post('/api/delete-account', checkAuth, deleteAccount)

	app.get('/api/get-location-name', getLocationName)

	// Landing page
	app.post('/api/search', search)
	app.post('/api/recommended', recommended)

	// Category pages
	app.get('/api/category', category)

	// Collections
	app.get('/api/favourites', checkAuth, favourites)
	app.get('/api/want-to-go', checkAuth, wantToGo)

	// Spot page
	app.get('/api/spot', spot)
	app.post('/api/mark-favourite', checkAuth, markFavourite)
	app.post('/api/mark-want-to-go', checkAuth, markWantToGo)
	app.post('/api/submit-review', checkAuth, submitReview)
	app.post('/api/edit-review', checkAuth, editReview)
	app.post('/api/delete-review', checkAuth, deleteReview)

	// Feedback page
	app.post('/api/submit-feedback', submitFeedback)

	const PORT = process.env.PORT || 5001
	app.listen(PORT, () => console.log(`Listening on port ${PORT} ...`))
}

main()
