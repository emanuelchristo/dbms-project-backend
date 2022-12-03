function category(req, res) {
	let { sort, location, page, type } = req.query
	location.latitude = Number(location.latitude)
	location.longitude = Number(location.longitude)
	page = parseInt(page)

	console.log({ sort, location, page, type })
	req.db.query(`SELECT * FROM spots WHERE type='${type}';`, (error, results, fields) => {
		if (error) throw error
		res.json(results)
	})
}

module.exports = { category }
