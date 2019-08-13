<template>
	<div id="register" :class="{ 'init': init }" class="container revealOnLoad">
		<form id="form" ref="register" :disabled="!init"
			@submit.prevent="register">
			<div :class="{ 'icon-loading-small-dark': loading, error: error }" class="email">
				<input id="emailprovider" ref="email" :placeholder="l10n.email"
					:disabled="!init" type="email" required
					value="">
				<label :disabled="!init || loading" for="submit-registration" class="button button--blue button--arrow">
					{{ signUp }}
				</label>
				<input id="submit-registration" :value="signUp" :disabled="!init || loading"
					type="submit" class="hidden">
			</div>
			<div class="checkboxes">
				<span>
					<input id="tos" ref="tos" v-model="tosAgreed"
						type="checkbox" name="tos" required>
					<label for="tos" class="tos">
						{{ l10n.tosagree.split('%tos%')[0].replace(/ /g, '&nbsp;') }}
						<a :href="selected.tos" target="_blank">
							{{ l10n.tos }}
						</a>
						{{ l10n.tosagree.split('%tos%')[1].replace(/ /g, '&nbsp;') }}
					</label>
				</span>
				<span>
					<input id="subscribe" ref="subscribe" type="checkbox"
						name="subscribe">
					<label for="subscribe">
						{{ l10n.subscribe }}
					</label>
				</span>
			</div>
		</form>
		<Provider v-if="selected" :provider="selected" :show="true"
			:init="init" :l10n="l10n" :official-apps="officialApps"
			:core-apps="coreApps" class="selected-provider" />
		<div id="show-more" :class="{opened: showAll, fadeout: loading, 'button--dropdown': init, 'icon-loading-dark': !init}"
			@click="toggleShowAll">
			<span v-if="init">
				{{ showAll ? l10n.close : l10n.change }}
			</span>
		</div>
		<div v-if="showAll === true" id="providers">
			<Provider v-for="(provider, key) in filteredProviders" :key="key"
				:init="init" :provider="provider"
				:l10n="l10n" :official-apps="officialApps"
				:core-apps="coreApps" />
		</div>
	</div>
</template>

<script>
import Provider from './Components/Provider'
import VueScrollTo from 'vue-scrollto'
import axios from 'axios'

export default {
	name: 'App',
	components: {
		Provider
	},
	data() {
		return {
			// Default nextcloud location
			ll: [48.7871141, 9.1547062],
			selected: false,	// current selected provider
			showAll: false,		// show all providers toggle
			loading: false,		// submit loading
			init: false,		// page init loading
			providers: [],		// empty providers list
			created: false,		// is the account creation successful
			error: false,		// is the request successful
			ocsapi: false,		// is the request made by an api
			officialApps: [],
			coreApps: [],
			tosAgreed: false,	// agreed to the tos ?
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
				toserror: 'Please agree to the terms of service'
			}
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
		}
	},
	async beforeMount() {
		// is this an ocs api request?
		this.ocsapi = window.register.dataset.ocsapi === '1'

		// init officialApps
		this.officialApps = JSON.parse(window.register.dataset.officialapps)

		this.coreApps = JSON.parse(window.register.dataset.coreapps)

		// set location
		let location = JSON.parse(window.register.dataset.ll)
		if (location.latitude && location.longitude) {
			this.ll = [location.latitude, location.longitude]
		}

		// merge server translations into local ones
		this.l10n = Object.assign(this.l10n, JSON.parse(window.register.dataset.l10n))

		// retrieve providers list
		await this.getProviders()

		// select if in url
		const hash = decodeURIComponent(window.location.hash.substr(1))
		if (hash.trim() !== '') {
			const providerIndex = this.providers.findIndex(prov => prov.name.toLowerCase().replace(' ', '_') === hash)
			if (providerIndex > -1) {
				this.selected = this.providers[providerIndex]
			}
		}
	},
	methods: {
		async getProviders() {
			await axios.get('/wp-json/signup/providers')
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
			let email = this.$refs.email.value
			let id = this.providers.findIndex(provider => {
				return provider === this.selected
			})
			let location = this.providers[id].selected
			let subscribe = this.$refs.subscribe.checked
			// success! redirection...
			axios
				.post('/wp-json/signup/account', {
					email,
					id,
					location,
					ocsapi: this.ocsapi,
					subscribe
				})
				.then(response => {
					this.created = true
					setTimeout(() => {
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
			if (this.loading || !this.init) {
				this.showAll = false
				return
			}
			this.showAll = !this.showAll
			VueScrollTo.scrollTo(!this.showAll ? '#register' : '#form', 500, {
				offset: -100
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

			let R = 6371 // km
			let x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2)
			let y = lat2 - lat1
			let d = Math.sqrt(x * x + y * y) * R

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
						long
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
			this.init = true
		}
	}
}
</script>

<style lang="scss" scoped>
$height: 20px;

#providers {
	display: flex;
	flex-direction: column;

	margin: auto;

	transform: translateY(15px);
	animation: 1s ease-out 0s 1 slideUpOnLoad;

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

	span {
		display: block;
		height: $height;
		line-height: $height;
	}
	&::before {
		right: 50%;
		margin-right: -90px;
		transform: translateX(50%);
	}
	&:hover,
	&.opened {
		opacity: .7;
	}
	&.opened {
		&::before {
			margin-right: -55px;
			transform: scaleY(-1);
		}
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
		border-radius: 22px 0 0 22px;
		background-color: #fff;

		font-size: 18px;
	}
	& > .button--blue {
		height: 44px;
		min-height: 0;
		margin: 0;
		margin-left: -25px;
		padding: 10px 60px 10px 20px;

		cursor: pointer;

		opacity: 1;

		line-height: 22px;
		&::before {
			right: 20px;
		}
		&:hover::before {
			right: 10px;
		}
	}
	&.icon-loading-small-dark,
	&.error {
		&::after {
			left: calc(100% - 32px);
			box-sizing: content-box;
		}
		& > input[type='email'] {
			width: 0;
			padding: 0;
		}
		& > .button--blue {
			width: 100%;
			margin-left: 0;

			text-align: left;
			&::before {
				opacity: 0;
			}
		}
	}
}

.checkboxes {
	position: relative;

	display: flex;
	align-items: flex-start;
	flex-direction: column;

	margin: 0 auto;

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

@keyframes slideUpOnLoad {
	0% {
		transform: translateY(15px);
		opacity: 0;
	}
	100% {
		transform: translateY(0px);
		opacity: 1;
	}
}

</style>
