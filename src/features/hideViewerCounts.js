;(function () {
	chrome.storage.sync.get(
		{ features: { showViewerCounts: true } },
		({ features: { showViewerCounts } }) => {
			if (showViewerCounts) return

			document.body.setAttribute('data-hide-viewer-counts', 'true')
		},
	)
})()
