;(function () {
	chrome.storage.sync.get(
		{ features: { hideTheSpider: false } },
		({ features: { hideTheSpider } }) => {
			if (hideTheSpider) {
				document.body.setAttribute('data-hide-the-spider', 'true')
			}
		},
	)
})()
