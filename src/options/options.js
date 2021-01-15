let content
let status
let timeout

const mapTypeToValue = {
	checkbox: 'checked',
	input: 'value',
	textarea: 'value',
	number: 'value',
}

const controls = [
	{
		description: `Highlight users in chat to help make sure you don't miss any messages.`,
		label: 'User Highlights',
		type: 'header',
	},
	{
		id: 'highlightOpacity',
		label: 'Highlight Opacity',
		initialValue: 200,
		type: 'number',
		category: 'features',
		max: 255,
		min: 0,
		step: 1,
	},
	{
		id: 'highlightBroadcasters',
		label: 'Highlight Broadcasters',
		initialValue: true,
		type: 'checkbox',
		category: 'features',
	},
	{
		id: 'highlightModerators',
		label: 'Highlight Moderators',
		initialValue: true,
		type: 'checkbox',
		category: 'features',
	},
	{
		id: 'highlightPartners',
		label: 'Highlight Partners',
		initialValue: false,
		type: 'checkbox',
		category: 'features',
	},
	{
		id: 'highlightVIPs',
		label: 'Highlight VIPs',
		initialValue: false,
		type: 'checkbox',
		category: 'features',
	},
	{
		id: 'highlightSubscribers',
		label: 'Highlight Subscribers',
		initialValue: false,
		type: 'checkbox',
		category: 'features',
	},
	{
		id: 'highlightUsers',
		label: 'Highlight Users (enter usernames separated by commas)',
		initialValue: '',
		type: 'textarea',
		category: 'features',
	},
	{
		id: 'ignoreUsers',
		label: 'Ignore Users (enter usernames separated by commas)',
		initialValue: 'StreamLabs, StreamElements, Nightbot',
		type: 'textarea',
		category: 'features',
	},
	{
		description: `The features below are currently under development. Due to the way Twitch chat functions, they aren't 100% reliable, so use with caution, and please reach out if you encounter any bugs!`,
		label: 'Experimental Features',
		type: 'header',
	},
	{
		description:
			"Add notes to users which are displayed next to their username in chat. Useful to keep track of users' preferred pronouns or nicknames!",
		label: 'User Notes',
		type: 'header',
	},
	{
		description: `Known issues: if you open and close the same user's profile multiple times, the note input is only visible the first time it's opened.`,
		type: 'description',
	},
	{
		id: 'userNotes',
		label: 'Enable User Notes',
		initialValue: false,
		type: 'checkbox',
		category: 'features',
	},
	{
		description:
			'Add filters to the chat which show/hide messages from different categories of user. Makes it easier to focus on the messages you need to see without preventing viewers from talking.',
		label: 'Chat Filters',
		type: 'header',
	},
	{
		description: `Known issues: this feature depends on Twitch chat icons to determine the user's roles. Twitch does not consistently display these icons, so sometimes messages will be filtered incorrectly.`,
		type: 'description',
	},
	{
		id: 'chatFilters',
		label: 'Enable Chat Filters',
		initialValue: false,
		type: 'checkbox',
		category: 'features',
	},
]

const renderControl = {
	checkbox(id, value, { label }) {
		return `
			<div>
				<label for="${id}">${label}:</label>
			</div>
			<div>
				<input type="checkbox" id="${id}" ${value ? 'checked' : ''} />
			</div>`
	},
	input(id, value, { label }) {
		return `
			<div>
				<label for="${id}">${label}:</label>
			</div>
			<div>
				<input type="text" id="${id}" value="${value}" />
			</div>`
	},
	textarea(id, value, { label }) {
		return `
			<div class="full-width">
				<label for="${id}">${label}:</label>
				<textarea id="${id}">${value}</textarea>
			</div>`
	},
	number(id, value, { label, max, min, step, isPercentage }) {
		return `
			<div class="full-width">
				<label for="${id}">
					${label}:
				</label>
				<input
					id="${id}"
					max="${max}"
					min="${min}"
					name="${id}"
					step="${step}"
					type="range"
					value="${value}"
				/>
			</div>`
	},
	header(id, value, { description, label }) {
		return `<h3>${label}</h3><p>${description}</p>`
	},
	description(id, value, { description }) {
		return `<p>${description}</p>`
	},
}

function render(state) {
	content.innerHTML = controls
		.map(({ category, id, initialValue, type, ...settings }) =>
			renderControl[type](
				id,
				state[category] && typeof state[category][id] !== 'undefined'
					? state[category][id]
					: initialValue,
				settings,
			),
		)
		.join('')
}

function save() {
	const state = controls.reduce((acc, { id, type, category }) => {
		if (category) {
			if (!acc[category]) {
				acc[category] = {}
			}
			acc[category][id] = document.getElementById(id)[
				mapTypeToValue[type]
			]
		}
		return acc
	}, {})

	chrome.storage.sync.set(state, () => {
		status.textContent = 'Options saved.'
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			status.textContent = ''
		}, 1000)
	})
}

document.addEventListener('DOMContentLoaded', () => {
	content = document.getElementById('content')
	status = document.getElementById('status')
	chrome.storage.sync.get(null, render)
})
document.getElementById('save').addEventListener('click', save)
