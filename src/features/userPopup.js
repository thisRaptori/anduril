;(function () {
	chrome.storage.sync.get(
		{ features: { userNotes: false } },
		({ features: { userNotes: enableUserNotes } }) => {
			if (!enableUserNotes) return

			let notes = {}
			let currentUser

			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type !== 'childList') {
						return
					}

					mutation.addedNodes.forEach((node) => {
						const userInfoContainer = node.querySelector(
							'.viewer-card-header__display-name',
						)

						if (!userInfoContainer) {
							return
						}

						const usernameContainer =
							userInfoContainer.childNodes[0]
						const username = usernameContainer.innerText.toLowerCase()

						if (username === currentUser) return
						currentUser = username

						chrome.storage.sync.get(
							{ userNotes: {} },
							({ userNotes }) => {
								notes = userNotes

								const wrapper = document.createElement('div')
								wrapper.classList.add('tw-flex')
								wrapper.innerHTML = `<span style="align-items: center; justify-content: center; margin-right: 4px; display: flex; width: 20px; height: 100%; font-size: 22px;">ℹ</span><input class="anduril_note-input tw-textarea" value="" placeholder="Type a note here..." style="border-radius: var(--border-radius-medium);" />`
								userInfoContainer.appendChild(wrapper)

								const input = wrapper.querySelector('input')
								input.focus()
								input.value = notes[username] || '' // set the value after focus to move the cursor to after the content
								input.onkeyup = () => {
									chrome.storage.sync.set({
										userNotes: {
											...userNotes,
											[username]: input.value,
										},
									})
									document
										.querySelectorAll(
											`.anduril_note-pill[data-username=${username}]`,
										)
										.forEach(
											(node) =>
												(node.innerHTML = input.value),
										)
								}
							},
						)
					})
				})
			})

			let prevHref
			const detectUrlChange = () => {
				if (prevHref === window.location.href) return

				prevHref = window.location.href

				const findViewerCard = () => {
					const viewerCard = document.querySelector(
						'.chat-room__viewer-card',
					)

					if (viewerCard) {
						observer.disconnect()
						observer.observe(viewerCard, {
							attributes: false,
							childList: true,
							subtree: true,
						})
					} else {
						setTimeout(findViewerCard, 100)
					}
				}

				setTimeout(findViewerCard, 100)
			}

			setInterval(detectUrlChange, 1000)
		},
	)
})()
