;(function () {
	chrome.storage.sync.get(
		{ features: { userNotes: false }, userNotes: null },
		({ features: { userNotes: enableUserNotes }, userNotes }) => {
			if (!enableUserNotes) return
			let notes = userNotes || {}

			if (!userNotes) {
				chrome.storage.sync.set({ userNotes: {} })
			}

			chrome.storage.onChanged.addListener((change) => {
				if (change.userNotes) {
					notes = change.userNotes.newValue
				}
			})

			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type !== 'childList') return

					mutation.addedNodes.forEach((node) => {
						if (!node.dataset || node.dataset.testSelector !== 'chat-line-message') {
							return
						}

						const usernameContainer = node.querySelector(
							'.chat-line__username',
						)
						const username = usernameContainer.innerText.toLowerCase()

						if (!notes[username]) {
							return
						}

						const displayNameElement = node.querySelector(
							'.chat-author__display-name',
						)

						const note = document.createElement('span')
						note.classList.add('anduril_note-pill')
						note.dataset.username = username
						note.style.background = displayNameElement.style.color
						note.innerHTML = `${notes[username]}`

						displayNameElement.parentElement.insertBefore(
							note,
							displayNameElement,
						)
					})
				})
			})

			let prevHref
			const detectUrlChange = () => {
				if (prevHref === window.location.href) return

				prevHref = window.location.href

				const findChat = () => {
					const chatList = document.querySelector(
						'.chat-list--default',
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
