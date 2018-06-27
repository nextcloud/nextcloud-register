<template>
	<div id="register" class="container revealOnLoad" :class="{ 'init': init }">
		<form id="form" @submit.prevent="register" ref="register" :disabled="!init">
			<div class="email" :class="{ 'icon-loading-small-dark': loading, error: error }">
				<input type="email" ref="email" required value="" :placeholder="l10n.email" id="emailprovider" :disabled="!init" />
				<label for="submit-registration" class="btn btn-primary" :disabled="!init || loading">{{signUp}}</label>
				<input type="submit" class="hidden" id="submit-registration" :value="signUp" :disabled="!init || loading" />
			</div>
			<div class="newsletter">
				<input type="checkbox" ref="subscribe" name="subscribe" id="subscribe" />
				<label for="subscribe">{{l10n.subscribe}}</label>
			</div>
		</form>
		<provider :provider="selected" :show="true" :init="init" class="selected-provider" :l10n="l10n" />
		<div id="show-more" @click="toggleShowAll"
			 :class="{opened: showAll, fadeout: loading, 'button--dropdown': init, 'icon-loading-dark': !init}">
			<span v-if="init">
				 {{ showAll ? l10n.close : l10n.change }}
			</span>
		</div>
		<div id="providers" v-if="showAll === true">
			<provider v-for="(provider, key) in providers" :key="key" :init="init"  :provider="provider" :l10n="l10n" />
		</div>
	</div>
</template>

<script>
import provider from './Components/Provider';
import VueScrollTo from 'vue-scrollto';
import axios from 'axios';
import Vue from 'vue';

export default {
	name: 'app',
	components: {
		provider
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
			l10n: {
				subscribe: 'Subscribe to our newsletter',
				email: 'Your email address',
				success: 'Success! Redirecting you to the provider',
				error: 'Error:',
				processing: 'Creating your account',
				register: 'Register',
				change: 'change provider',
				close: 'close',
				far: 'Far far away'
			}
		};
	},
	beforeMount() {
		// is this an ocs api request?
		this.ocsapi = window.register.dataset.ocsapi === '1';

		// set location
		let location = JSON.parse(window.register.dataset.ll);
		if (location.latitude && location.longitude) {
			this.ll = [location.latitude, location.longitude];
		}
		// retrieve providers list
		this.getProviders();

		// merge server translations into local ones
		this.l10n = Object.assign(this.l10n, JSON.parse(window.register.dataset.l10n));
	},
	computed: {
		signUp() {
			if (this.created) {
				return this.l10n.success;
			} else if (this.error !== false) {
				return this.l10n.error + ' ' + this.error;
			} else if (this.loading) {
				return this.l10n.processing;
			}
			return this.l10n.register;
		}
	},
	methods: {
		getProviders() {
			axios.get('/wp-json/register/providers')
			.then(response => {
				this.providers = response.data;
				this.scoreProvider(this.ll[0], this.ll[1]);
			})
			.catch(response => {
				this.error = 'Error while retrieving the providers list.'
			});
		},
		// submit
		register() {
			if (this.error !== false) {
				// user clicked again, let's reset the error
				this.loading = false;
				this.error = false;
				return;
			}
			this.toggleLoading();
			this.showAll = false;
			let email = this.$refs.email.value;
			let id = this.providers.findIndex(provider => {
				return provider === this.selected;
			});
			let subscribe = this.$refs.subscribe.checked;
			// success! redirection...
			axios
				.post('/wp-json/register/account', {
					email,
					id,
					ocsapi: this.ocsapi,
					subscribe
				})
				.then(response => {
					this.created = true;
					setTimeout(() => {
						window.location = response.data;
					}, 2000);
				})
				.catch(error => {
					this.error = error.response.data.message;
					this.loading = false;
					setTimeout(() => {
						this.showAll = true;
						this.error = false;
					}, 4000);
				});
		},
		// toggle showAll
		toggleShowAll() {
			if (this.loading || !this.init) {
				this.showAll = false;
				return;
			}
			this.showAll = !this.showAll;
			VueScrollTo.scrollTo(!this.showAll ? '#register' : '#form', 500, {
				offset: -100
			});
		},
		// toggle loading state
		toggleLoading() {
			this.loading = !this.loading;
		},
		// convert deg to rad
		deg2Rad(deg) {
			return deg * Math.PI / 180;
		},
		// return distance between two coordinates
		pythagorasEquirectangular(lat1, lon1, lat2, lon2) {
			lat1 = this.deg2Rad(lat1);
			lat2 = this.deg2Rad(lat2);
			lon1 = this.deg2Rad(lon1);
			lon2 = this.deg2Rad(lon2);

			let R = 6371; // km
			let x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
			let y = lat2 - lat1;
			let d = Math.sqrt(x * x + y * y) * R;

			return d;
		},
		// add distance to provider
		scoreProvider(latitude, longitude) {
			let mindif = 99999;
			// let's test all of the providers and select the closest one
			this.providers.forEach((provider, index) => {
				let mindifprov = 99999;
				// let's test all of the locations and use the closest one as default for this provider
				provider.ll.forEach(({ lat, long, city }) => {
					let dif = this.pythagorasEquirectangular(
						latitude,
						longitude,
						lat,
						long
					);
					// if score of this provider's loc is better than the previous, save it as default for this provider
					if (dif < mindifprov) {
						mindifprov = dif;
						this.$set(provider, 'score', Math.round(dif));
						this.$set(provider, 'city', city);
					}
				});
				// if score of this provider is better than the previous one, select it
				if (mindifprov < mindif) {
					mindif = mindifprov;
					this.selected = provider;
				}
			});
			this.init = true;
		}
	}
};
</script>

<style lang="scss" scoped>
#providers {
	display: flex;
	flex-direction: column;
	margin: auto;
	transform: translateY(15px);
	opacity: 0;
	animation: 1s ease-out 0s 1 slideUpOnLoad;
	animation-fill-mode: forwards;
}
#show-more {
	$height: 20px;
	height: $height * 2;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	text-align: center;
	font-weight: 100;
	cursor: pointer;
	position: relative;
	opacity: 0.5;
	box-sizing: content-box;
	color: #fff;
	transition: all 0.2s ease-in;
	span {
		height: $height;
		display: block;
		line-height: $height;
	}
	&::before {
		right: 50%;
		transform: translateX(50%);
		margin-right: -90px;
	}
	&:hover,
	&.opened {
		opacity: 0.7;
	}
	&.opened {
		&::before {
			transform: scaleY(-1);
			margin-right: -55px;
		}
	}
	&.fadeout {
		opacity: 0;
	}
}
#form {
	top: 30vh;
	width: 100%;
	padding: 0 10px;
	&[disabled] {
		opacity: 0.65;
	}
}
.email {
	display: flex;
	align-items: center;
	filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.3));
	> input,
	> label {
		transition: all 0.2s ease-in;
		&:focus {
			outline: none;
		}
	}
	> input[type='email'] {
		height: 44px;
		padding: 5px 35px 5px 20px;
		font-size: 18px;
		/* flex grow to fit the parent width */
		width: 0;
		flex: 1 0 auto;
		border-width: 0px;
		border-radius: 22px 0 0 22px;
		background-color: #fff;
	}
	> .btn-primary {
		padding: 10px 60px 10px 20px;
		height: 44px;
		margin-left: -25px;
		opacity: 1;
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
		> input[type='email'] {
			width: 0;
			padding: 0;
		}
		> .btn-primary {
			margin-left: 0;
			width: 100%;
			text-align: left;
			&::before {
				opacity: 0;
			}
		}
	}
}

.newsletter {
	user-select: none;
	position: relative;
	input {
		display: none;
		&:checked + label {
			&, &::before {
				opacity: .7;
				content: '✓'
			}
		}
	}
	label {
		color: #fff;
		opacity: .5;
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 8px 0;
		justify-content: center;		
		&::before {
			content: ' ';
			display: block;
			font-weight: 600;
			width: 15px; // align w/ email input
			height: 15px;
			line-height: 14px;
			font-size: 14px;
			text-align: center;
			border: 1px solid rgba(255, 255, 255, .7);
			border-radius: 3px;
			margin-right: 5px;
		}
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
