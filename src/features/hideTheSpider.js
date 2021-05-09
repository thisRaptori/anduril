;(function () {
	chrome.storage.sync.get(
		{ features: { hideTheSpider: true } },
		({ features: { hideTheSpider } }) => {
			if (hideTheSpider) return

			document.body.setAttribute('data-hide-the-spider', 'true')
		},
	)
})()
