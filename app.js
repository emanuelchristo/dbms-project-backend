require('dotenv').config()
const express = require('express')
const cors = require('cors')

const { checkAuth } = require('./middlewares/auth')
const { getUser, signIn, signOut, signUp } = require('./controllers/user')
const { search } = require('./controllers/search')
const { recommended } = require('./controllers/recommended')
const { places, restaurants, movies, hotels } = require('./controllers/browse')
const { favourites, wantToGo } = require('./controllers/collections')
const { spot, submitReview, markFavourite, markWantToGo } = require('./controllers/spot')
const { submitFeedback } = require('./controllers/feedback')

const app = express()

// MIDDLEWARES
app.use(cors())
app.use(express.json())

// ROUTES

// User
app.get('/user', checkAuth, getUser)
app.post('/sign-in', signIn)
app.post('/sign-out', checkAuth, signOut)
app.post('/sign-up', signUp)

// Landing page
app.post('/search', search)
app.get('/recommended', recommended)

// Browse pages
app.get('/places', places)
app.get('/restaurants', restaurants)
app.get('/movies', movies)
app.get('/hotels', hotels)

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
