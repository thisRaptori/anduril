;(function () {
	chrome.storage.sync.get(
		{ features: { chatFilters: false } },
		({ features: { chatFilters } }) => {
			if (!chatFilters) return

			let chatContainer
			let chatScrollElement

			const toggleFilter = (filter) => {
				if (chatContainer) {
					chatContainer.dataset[filter] =
						chatContainer.dataset[filter] === 'show'
							? 'hide'
							: 'show'
				}
			}

			const scrollToBottom = () => {
				if (chatScrollElement) {
					// timeout so that this happens after the chat visibility change happens
					setTimeout(() => {
						// would be nice to use Infinity here, but it doesn't work for some reason!
						chatScrollElement.scrollTo(9999999, 9999999)
					}, 10)

					// click the "unpause chat" button if it's visible
					const chatFooter = chatContainer.querySelector(
						'.chat-paused-footer',
					)
					if (chatFooter) {
						chatFooter.querySelector('button').click()
					}
				}
			}

			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type !== 'childList') {
						return
					}

					mutation.addedNodes.forEach((node) => {
						if (!node.dataset || node.dataset.testSelector !== 'chat-line-message') {
							return
						}

						;[
							['[alt="Broadcaster"]', 'anduril_broadcaster'],
							['[alt="Moderator"]', 'anduril_moderator'],
							['[alt="VIP"]', 'anduril_vip'],
							['[alt="Verified"]', 'anduril_verified'],
							['[alt*="Subscriber"]', 'anduril_subscriber'],
						].forEach(([selector, className]) => {
							if (node.querySelector(selector)) {
								node.classList.add(className)
							}
						})
					})
				})
			})

			let prevHref
			const detectUrlChange = () => {
				if (prevHref === window.location.href) return

				prevHref = window.location.href

				const findChat = () => {
					chatContainer = document.querySelector('.stream-chat')

					if (
						chatContainer &&
						!chatContainer.querySelector(
							'.anduril_chat-filters-container',
						)
					) {
						chatContainer.classList.add('anduril_filtered-chat')
						chatScrollElement = chatContainer.querySelector(
							'.simplebar-scroll-content',
						)

						observer.disconnect()
						observer.observe(
							chatContainer.querySelector('.chat-list--default'),
							{
								attributes: false,
								childList: true,
								subtree: true,
							},
						)
						// set all to 'show' initially
						toggleFilter('moderator')
						toggleFilter('vip')
						toggleFilter('verified')
						toggleFilter('subscriber')
						toggleFilter('all')

						const controls = document.createElement('div')
						controls.classList.add('anduril_chat-filters-container')
						controls.innerHTML = `
							<button data-target="all" class="anduril_chat-filter tw-core-button--secondary">All</button>
							<button data-target="moderator" class="anduril_chat-filter tw-core-button--secondary">Mod</button>
							<button data-target="vip" class="anduril_chat-filter tw-core-button--secondary">VIP</button>
							<button data-target="verified" class="anduril_chat-filter tw-core-button--secondary">Verified</button>
							<button data-target="subscriber" class="anduril_chat-filter tw-core-button--secondary">Sub</button>
						`
						controls.onclick = (e) => {
							toggleFilter(e.target.dataset.target)
							scrollToBottom()
						}
						const chatInput = chatContainer.querySelector(
							'.chat-input',
						)
						chatInput.parentElement.insertBefore(
							controls,
							chatInput,
						)
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
