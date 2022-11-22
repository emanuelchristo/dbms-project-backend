function checkAuth(req, res, next) {
	console.log('auth middleware')
	next()
}

module.exports = { checkAuth }
