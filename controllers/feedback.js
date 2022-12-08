async function submitFeedback(req, res) {
	try {
		const { feedback } = req.body
		if (!feedback) {
			res.status(400).json({ error: 'Feedback required' })
			return
		}
		await req.db.query(`INSERT INTO feedback (feedback) VALUES ("${feedback}");`)
		res.sendStatus(200)
	} catch (err) {
		console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { submitFeedback }
