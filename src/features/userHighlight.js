;(function () {
	function getParentWithClass(element, className) {
		if (element.classList.contains(className)) {
			return element
		}
		if (element.parentElement) {
			return getParentWithClass(element.parentElement, className)
		}
	}

	const parse = (str) =>
		str.toLowerCase().replace(/ /g, '').split(',').filter(Boolean)

	chrome.storage.sync.get(
		{
			features: {
				highlightBroadcasters: true,
				highlightModerators: true,
				highlightOpacity: 200,
				highlightPartners: false,
				highlightVIPs: false,
				highlightSubscribers: false,
				highlightUsers: '',
				ignoreUsers: 'Streamlabs, Streamelements, Nightbot',
			},
		},
		({
			features: {
				highlightBroadcasters,
				highlightModerators,
				highlightOpacity,
				highlightPartners,
				highlightVIPs,
				highlightSubscribers,
				highlightUsers: _highlightUsers,
				ignoreUsers: _ignoreUsers,
			},
		}) => {
			const highlightUsers = parse(_highlightUsers)

			const shouldWatchMessages =
				highlightBroadcasters ||
				highlightModerators ||
				highlightPartners ||
				highlightVIPs ||
				highlightSubscribers ||
				highlightUsers.length

			if (!shouldWatchMessages) {
				return
			}

			const ignoreUsers = parse(_ignoreUsers)

			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type !== 'childList') {
						return
					}

					mutation.addedNodes.forEach((node) => {
						if (
							!node.dataset ||
							node.dataset.testSelector !== 'chat-line-message'
						) {
							return
						}

						const username = node
							.querySelector('.chat-line__username')
							.innerText.toLowerCase()

						const highlightMessage =
							(highlightBroadcasters &&
								node.querySelector('[alt="Broadcaster"]')) ||
							(highlightModerators &&
								node.querySelector('[alt="Moderator"]')) ||
							(highlightVIPs &&
								node.querySelector('[alt="VIP"]')) ||
							(highlightPartners &&
								node.querySelector('[alt="Verified"]')) ||
							(highlightSubscribers &&
								node.querySelector('[alt*="Subscriber"]')) ||
							highlightUsers.includes(username)

						if (
							!highlightMessage ||
							ignoreUsers.includes(username)
						) {
							return
						}

						let colour = node.querySelector(
							'.chat-author__display-name',
						).style.color
						if (colour.startsWith('#')) {
							colour = `${colour}${highlightOpacity.toString(16)}`
						}
						if (colour.startsWith('rgb')) {
							;[r, g, b] = colour
								.replace(/rgba?\(|\)/g, '')
								.split(',')
								.map((c) => c.trim())

							colour = `rgba(${r}, ${g}, ${b}, ${(
								highlightOpacity / 255
							).toFixed(2)})`
						}

						node.style[
							'box-shadow'
						] = `inset 16px 3px 0 0 ${colour}`
						node.style['transition'] = `.5s ease all`
					})
				})
			})

			let prevHref
			const detectUrlChange = () => {
				if (prevHref === window.location.href) return

				prevHref = window.location.href

				const findChat = () => {
					const chatList = document.querySelector(
						'.chat-list--default, .chat-list--other',
					)

					if (chatList) {
						observer.disconnect()
						observer.observe(chatList, {
							attributes: false,
							childList: true,
							subtree: true,
						})
					} else {
						setTimeout(findChat, 100)
					}
				}

				setTimeout(findChat, 100)
			}

			setInterval(detectUrlChange, 1000)
		},
	)
})()
