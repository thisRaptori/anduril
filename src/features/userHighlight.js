;(function () {
	function getParentWithClass(element, className) {
		if (element.classList.contains(className)) {
			return element
		}
		if (element.parentElement) {
			return getParentWithClass(element.parentElement, className)
		}
	}

	let seenUsers = {}
	let debounceTimeout

	const saveSeenUsers = () => {
		chrome.storage.sync.set({
			firstMessageState: {
				seenUsers,
				lastUpdated: Date.now(),
			},
		})
	}

	const hasUserBeenSeen = (username) => {
		if (seenUsers[username]) {
			clearTimeout(debounceTimeout)
			debounceTimeout = setTimeout(saveSeenUsers, 500)
			return true
		}
		seenUsers[username] = true
		saveSeenUsers()
		return false
	}

	const parse = (str) =>
		str.toLowerCase().replace(/ /g, '').split(',').filter(Boolean)

	chrome.storage.sync.get(
		{
			features: {
				highlightBroadcasters: true,
				highlightFirstMessage: '',
				highlightModerators: true,
				highlightOpacity: 200,
				highlightPartners: false,
				highlightVIPs: false,
				highlightSubscribers: false,
				highlightUsers: '',
				highlightedMentions: true,
				ignoreUsers: 'Streamlabs, Streamelements, Nightbot',
			},
			firstMessageState: {
				seenUsers: {},
				lastUpdated: null,
			},
		},
		({
			features: {
				highlightBroadcasters,
				highlightFirstMessage,
				highlightModerators,
				highlightOpacity,
				highlightPartners,
				highlightVIPs,
				highlightSubscribers,
				highlightUsers: _highlightUsers,
				highlightedMentions,
				ignoreUsers: _ignoreUsers,
			},
			firstMessageState,
		}) => {
			const AN_HOUR = 1000 * 60 * 60
			if (
				firstMessageState.lastUpdated &&
				Date.now() - firstMessageState.lastUpdated < AN_HOUR
			) {
				seenUsers = firstMessageState.seenUsers
			}

			const highlightUsers = parse(_highlightUsers)
			const highlightChannels = parse(highlightFirstMessage)

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

						if (
							highlightChannels.some((channel) =>
								window.location.pathname.includes(channel),
							) &&
							!hasUserBeenSeen(username)
						) {
							node.classList.add('anduril_first-message')
						}

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

						if (
							highlightedMentions &&
							node.querySelector('.mention-fragment--recipient')
						) {
							node.setAttribute(
								'style',
								`background: ${colour} !important; color: var(--color-hinted-grey-1) !important`,
							)
							node.classList.add('anduril_mention-recipient')
						} else {
							node.style[
								'box-shadow'
							] = `inset 16px 3px 0 0 ${colour}`
							node.style['transition'] = `.5s ease all`
						}
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
