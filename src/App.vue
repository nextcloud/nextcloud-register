<template>
	<div id="register" class="container revealOnLoad" :class="{'init': init}">
		<form id="form" @submit.prevent="register" ref="register" :disabled="!init">
			<div class="email" :class="{'icon-loading-small-dark': loading, error: error}">
				<input type="email" ref="email" required value="" placeholder="Your email address" id="emailprovider" :disabled="!init" />
				<label for="submit-registration" class="btn btn-primary" :disabled="!init||loading">{{signUp}}</label>
				<input type="submit" class="hidden" id="submit-registration" :value="signUp" :disabled="!init||loading" />
			</div>
			<div class="newsletter"></div>
		</form>
		<provider :provider="selected" :show="true" :init="init" class="selected-provider" />
		<div id="show-more" @click="toggleShowAll"
			 :class="{opened: showAll, fadeout: loading, 'button--dropdown': init, 'icon-loading-dark': !init}">
			<span v-if="init">
				 {{showAll ? 'close' : 'change provider'}}
			</span>
		</div>
		<div id="providers" v-if="showAll===true">
			<provider v-for="(provider, key) in providers" :key="key" :init="init"  :provider="provider" />
		</div>
	</div>
</template>

<script>
import provider from './Components/Provider';
import VueScrollTo from 'vue-scrollto';
import axios from 'axios';

export default {
	name: 'app',
	components: {
		provider
	},
	data() {
		return {
			// Default nextcloud location
			ll: [48.7871141, 9.1547062],
			selected: false, // current selected provider
			showAll: false, // show all providers toggle
			loading: false, // submit loading
			init: false, // page init loading
			providers: [], // empty providers list
			created: false, // is the account creation successful
			error: false, // is the request successful
			ocsapi: false // is the request successful
		};
	},
	beforeMount() {
		let location = JSON.parse(window.register.dataset.ll);
		this.ocsapi = window.register.dataset.ocsapi === '1';
		if (location.latitude && location.longitude) {
			this.ll = [location.latitude, location.longitude];
		}
		this.getProviders();
	},
	computed: {
		signUp() {
			if (this.created) {
				return 'Success! Redirecting you to the provider';
			} else if (this.error !== false) {
				return 'Error: ' + this.error;
			} else if (this.loading) {
				return 'Creating your account';
			}
			return 'Register';
		}
	},
	methods: {
		getProviders() {
			axios.get('/wp-json/register/providers').then(response => {
				this.providers = response.data;
				this.scoreProvider(this.ll[0], this.ll[1]);
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
			// success! redirection...
			axios
				.post('/wp-json/register/account', {
					email,
					id,
					ocsapi: this.ocsapi
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
	margin-bottom: 20px;
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