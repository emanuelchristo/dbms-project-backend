const axios = require('axios')

async function getLocationName(req, res) {
	try {
		const { latitude, longitude } = req.query
		const { data } = await axios.get(
			`https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATION_IQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
		)
		let village = data?.address?.village
		let county = data?.address?.county

		res.send(village || county)
	} catch (err) {
		// console.error(err)
		res.sendStatus(500)
	}
}

module.exports = { getLocationName }
