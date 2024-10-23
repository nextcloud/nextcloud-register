<template>
	<div id="register" class="container">
		<form id="form"
			ref="register"
			:disabled="!initialized"
			@submit.prevent="register">
			<!-- Email input and submit -->
			<div :class="{ error: error }" class="email">
				<input id="emailprovider"
					ref="email"
					:placeholder="l10n.email"
					:disabled="!initialized"
					type="email"
					required
					value="">
				<label :disabled="!initialized || loading" for="submit-registration" class="c-btn btn-blue">
					{{ signUp }}
					<ArrowRight v-if="!loading" title="" :size="20" />
					<Loading v-else title="" :size="20" />
				</label>
				<input v-show="false"
					id="submit-registration"
					:value="signUp"
					:disabled="!initialized || loading"
					type="submit">
			</div>

			<!-- TOS and newsletter checkbox -->
			<div class="checkboxes">
				<span>
					<input id="tos"
						ref="tos"
						v-model="tosAgreed"
						:disabled="!initialized"
						type="checkbox"
						name="tos"
						required>
					<label for="tos" class="tos">
						{{ l10n.tosagree.split('%tos%')[0].replace(/ /g, '&nbsp;') }}
						<a :href="selected.tos" target="_blank">
							{{ l10n.tos }}
						</a>
						{{ l10n.tosagree.split('%tos%')[1].replace(/ /g, '&nbsp;') }}
					</label>
				</span>
				<span>
					<input id="subscribe"
						ref="subscribe"
						:disabled="!initialized"
						type="checkbox"
						name="subscribe">
					<label for="subscribe">
						{{ l10n.subscribe }}
					</label>
				</span>
			</div>
		</form>

		<!-- Selected closest provider -->
		<Provider :provider="selected"
			:show="true"
			:initialized="initialized"
			:l10n="l10n"
			:official-apps="officialApps"
			:core-apps="coreApps"
			class="selected-provider" />

		<!-- Show more button -->
		<div v-if="initialized"
			id="show-more"
			:class="{ opened: showAll, fadeout: loading}"
			@click="toggleShowAll">
			{{ showAll ? l10n.close : l10n.change }}
			<ChevronDown v-if="!showAll" title="" :size="16" />
			<ChevronUp v-else title="" :size="16" />
		</div>

		<!-- List of providers -->
		<div v-if="showAll === true" id="providers">
			<Provider v-for="(provider, key) in filteredProviders"
				:key="key"
				:core-apps="coreApps"
				:initialized="initialized"
				:l10n="l10n"
				:official-apps="officialApps"
				:provider="provider"
				:selected="provider === selected"
				@select="onSelect(provider)" />
		</div>
	</div>
</template>

<script>
import ArrowRight from 'vue-material-design-icons/ArrowRight.vue'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import Loading from 'vue-material-design-icons/Loading.vue'
import Provider from './Components/Provider.vue'
import VueScrollTo from 'vue-scrollto'
import axios from 'axios'

export default {
	name: 'Register',

	components: {
		ArrowRight,
		ChevronDown,
		ChevronUp,
		Loading,
		Provider,
	},

	data() {
		return {
			// Default nextcloud location
			ll: [48.7871141, 9.1547062],
			// current selected provider
			selected: {
				locations: [],
				apps: [],
			},
			// show all providers toggle
			showAll: false,
			// submit loading
			loading: false,
			// page initialized
			initialized: false,
			// empty providers list
			providers: [],
			// is the account creation successful
			created: false,
			// is the request successful
			error: false,
			// is the request made by an api
			ocsapi: false,
			officialApps: {},
			coreApps: [],
			// agreed to the tos ?
			tosAgreed: false,
			l10n: {
				subscribe: 'Subscribe to our newsletter',
				email: 'Your email address',
				success: 'Success! Redirecting you to the provider',
				error: 'Error:',
				processing: 'Creating your account',
				register: 'Sign up',
				change: 'change provider',
				close: 'close',
				far: 'Far far away',
				geterror: 'Error while retrieving the providers list.',
				tos: 'Terms of service',
				tosagree: 'I agree to the %tos%',
				toserror: 'Please agree to the terms of service',
			},
		}
	},

	computed: {
		signUp() {
			if (this.created) {
				return this.l10n.success
			} else if (this.error !== false) {
				return this.l10n.error + ' ' + this.error
			} else if (this.loading) {
				return this.l10n.processing
			}
			return this.l10n.register
		},
		filteredProviders() {
			return this.providers.filter(provider => provider !== this.selected)
		},
	},

	beforeMount() {
		// is this an ocs api request?
		this.ocsapi = window.register?.dataset?.ocsapi === '1'
		if (this.ocsapi) {
			console.debug('This registration will be treated as an OCS API request', this.ocsapi)
		}

		// merge server translations into local ones
		this.l10n = window.register?.dataset?.l10n
			? Object.assign(this.l10n, JSON.parse(window.register.dataset.l10n || '{}'))
			: this.l10n

		// init apps
		this.officialApps = JSON.parse(window.register?.dataset?.officialapps || '{}')
		this.coreApps = JSON.parse(window.register?.dataset?.coreapps || '[]')

		// set location
		const location = JSON.parse(window.register?.dataset?.ll || '{}')
		console.debug('Location data', location)
		if (location.latitude && location.longitude) {
			this.ll = [location.latitude, location.longitude]
		}

		// retrieve providers list
		this.getProviders().then(() => {
			// select if in url
			const hash = decodeURIComponent(window.location.hash.slice(1))
			if (hash.trim() !== '') {
				const providerIndex = this.providers.findIndex(prov => prov.name.toLowerCase().replace(/ /g, '_') === hash)
				if (providerIndex > -1) {
					this.selected = this.providers[providerIndex]
				}
			} else {
				const minScores = this.providers.map(provider => Math.min.apply(null, provider.locations.map(location => location.score)))
				const minScore = Math.min.apply(null, minScores)
				const providerIndex = minScores.findIndex(score => score === minScore)
				this.selected = this.providers[providerIndex]
			}
			console.debug('Selected provider', this.selected)
		})
	},

	methods: {
		getProviders() {
			return axios.get(providersUrl)
				.then(response => {
					this.providers = response.data
					this.scoreProvider(this.ll[0], this.ll[1])
				})
				.catch(response => {
					this.error = this.l10n.geterror
					console.error(response)
				})
		},

		// submit
		register() {
			if (this.error !== false) {
				// user clicked again, let's reset the error
				this.loading = false
				this.error = false
				return
			}

			if (!this.tosAgreed) {
				this.error = this.l10n.toserror
				return
			}

			this.toggleLoading()
			this.showAll = false

			const subscribe = this.$refs.subscribe.checked
			const email = this.$refs.email.value
			const id = this.providers.findIndex(provider => {
				return provider === this.selected
			})

			const scores = this.selected.locations.map(location => location.score)
			const closest = Math.min.apply(null, scores)
			const location = this.selected.locations.findIndex(location => location.score === closest)

			axios.post('/wp-json/signup/account', {
				email,
				id,
				location,
				ocsapi: this.ocsapi,
				subscribe,
			})
				.then(response => {
					this.created = true
					setTimeout(() => {
						// success! redirection...
						window.location = response.data
					}, 2000)
				})
				.catch(error => {
					this.error = error.response.data.message
					this.loading = false
					setTimeout(() => {
						this.showAll = true
						this.error = false
					}, 4000)
				})
		},

		// toggle showAll
		toggleShowAll() {
			if (this.loading || !this.initialized) {
				this.showAll = false
				return
			}
			this.showAll = !this.showAll
			VueScrollTo.scrollTo(!this.showAll ? '#register' : '#form', 500, {
				offset: -100,
			})
		},

		// toggle loading state
		toggleLoading() {
			this.loading = !this.loading
		},

		// convert deg to rad
		deg2Rad(deg) {
			return deg * Math.PI / 180
		},

		// return distance between two coordinates
		pythagorasEquirectangular(lat1, lon1, lat2, lon2) {
			lat1 = this.deg2Rad(lat1)
			lat2 = this.deg2Rad(lat2)
			lon1 = this.deg2Rad(lon1)
			lon2 = this.deg2Rad(lon2)

			const R = 6371 // km
			const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2)
			const y = lat2 - lat1
			const d = Math.sqrt(x * x + y * y) * R

			return d
		},

		// add distance to provider
		scoreProvider(latitude, longitude) {
			// set distance for every Provider
			this.providers.forEach((provider, index) => {
				provider.locations = provider.locations.map(({ lat, long, city }) => {
					const score = Math.round(this.pythagorasEquirectangular(
						latitude,
						longitude,
						lat,
						long,
					))
					return { lat, long, city, score }
				})
			})

			// reduce Providers array to get the nearest Provider
			if (!this.selected) {
				let minScore = 9999999999
				this.providers.forEach(provider => {
					// getting the max score amongst all locations for the desired provider
					const providerScores = provider.locations.map(loc => loc.score)
					const providerMin = Math.min(...providerScores)
					console.debug(provider.name, 'min score is', providerMin, `(amongst ${providerScores})`)
					if (minScore > providerMin) {
						this.selected = provider
						minScore = providerMin
					}
				})
				console.debug('Winning min score is', minScore, 'for', this.selected.name)
			}
			this.initialized = true
		},

		// user selected a provider
		onSelect(provider) {
			console.debug('Selected provider', provider.name, provider)
			this.selected = provider
			this.showAll = false
		},
	},
}
</script>

<style lang="scss" scoped>
$height: 20px;

#providers {
	display: flex;
	flex-direction: column;
	margin: auto;
	transform: translateY(15px);
	animation: var(--provider-slide-up);
	opacity: 0;

	animation-fill-mode: forwards;
}

#show-more {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: content-box;
	width: 100%;
	height: $height * 2;
	cursor: pointer;
	transition: all .2s ease-in;
	text-align: center;
	opacity: .5;
	color: #fff;
	font-weight: 100;

	.chevron-down-icon,
	.chevron-up-icon {
		margin-left: 10px;
	}

	&:hover,
	&.opened {
		opacity: .7;
	}
	&.fadeout {
		opacity: 0;
	}
}

#form {
	top: 30vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	padding: 0 10px;
	&[disabled] {
		opacity: .65;
	}
}

.email {
	display: flex;
	align-items: center;

	filter: drop-shadow(0 5px 5px rgba(0, 0, 0, .3));
	& > input,
	& > label {
		transition: all .2s ease-in;
		&:focus {
			outline: none;
		}
	}
	& > input[type='email'] {
		flex: 1 0 auto;
		/* flex grow to fit the parent width */
		width: 0;
		height: 44px;
		padding: 5px 35px 5px 20px;
		border-width: 0;
		border-radius: 8px 0 0 8px;
		background-color: #fff;
		font-size: 18px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	& > .btn-blue {
		height: 44px;
		min-height: 0;
		margin: 0;
		margin-left: -25px;
		padding: 10px 20px;
		cursor: pointer;
		opacity: 1;
		line-height: 18px;
		min-width: 150px;
		display: flex;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 400px;
		.arrow-right-icon,
		.loading-icon {
			margin-left: 10px;
			transition: transform 200ms ease-in-out;
		}
		&:hover .arrow-right-icon {
			transform: translateX(10px);
		}
		.loading-icon {
			animation: 1600ms spin cubic-bezier(0.55, 0.75, 0.65, 0.25) infinite;
		}
	}
	&.icon-loading,
	&.error {
		&::after {
			left: calc(100% - 32px);
			box-sizing: content-box;
		}
	}
}

.checkboxes {
	position: relative;
	display: flex;
	align-items: flex-start;
	flex-direction: column;
	margin: 10px auto;
	user-select: none;
	span {
		position: relative;
	}
	input {
		position: absolute;
		top: 14px;
		opacity: 0;
		&:checked + label {
			&, &::before {
				content: '✓';
				opacity: .7;
			}
		}
	}
	label {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px 0;
		cursor: pointer;
		opacity: .5;
		&, a {
			color: #fff;
		}
		&::before {
			display: block;
			width: 15px; // align w/ email input
			height: 15px;
			margin-right: 5px;
			content: ' ';
			text-align: center;
			border: 1px solid rgba(255, 255, 255, .7);
			border-radius: 3px;
			font-size: 14px;
			font-weight: 600;
			line-height: 14px;
		}
	}

	label.tos {
		padding-bottom: 0;
		opacity: .7;
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>