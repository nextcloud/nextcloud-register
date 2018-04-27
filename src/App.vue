<template>
	<div id="register" class="container revealOnLoad">
		<provider :provider="selected" :show="true" class="selected-provider" />
		<div id="show-more" class="button--dropdown" :class="{opened: showAll, fadeout: loading}"
			 @click="toggleShowAll"><span>{{showAll ? 'close' : 'change provider'}}</span></div>
		<form id="form" @submit.prevent="register" ref="register">
			<div class="email" :class="{'icon-loading-small-dark': loading}">
				<input type="email" required value="" placeholder="Your email address" id="emailprovider" />
				<input type="submit" class="btn btn-primary" :value="signUp" />
			</div>
			<div class="newsletter"></div>
		</form>
		<div id="providers" v-if="showAll===true">
			<provider v-for="(provider, key) in providers" :key="key" :provider="provider" />
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
			selected: false,
			showAll: false,
			loading: false,
			providers: []
		};
	},
	beforeMount() {
		let location = JSON.parse(window.register.dataset.ll);
		if (location.latitude && location.longitude) {
			this.ll = [location.latitude, location.longitude];
		}
		this.getProviders();
	},
	computed: {
		signUp() {
			if (this.loading) {
				return 'Creating your account';
			}
			return 'Sign Up';
		}
	},
	methods: {
		getProviders() {
			axios.get('/wp-content/themes/nextcloud.com/assets/preferred.json').then((response) => {
				this.providers = response.data;
				this.scoreProvider(this.ll[0], this.ll[1]);
			})
		},
		// submit
		register() {
			this.toggleLoading();
		},
		// toggle showAll
		toggleShowAll() {
			if (this.loading) {
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
				provider.ll.forEach(({lat, long, city}) => {
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
		}
	}
};
</script>

<style lang="scss" scoped>
#register {
	width: 500px;
	max-width: 100vw;
	position: relative;
	margin-top: -195px;
	padding: 0;
	transform: translateY(15px);
	opacity: 0;
	animation: 1s ease-out 3s 1 slideUpOnLoad;
	animation-fill-mode: forwards;
}
#providers {
	display: flex;
	flex-direction: column;
	max-width: 500px;
	margin: auto;
	margin-top: 20px;
	transform: translateY(15px);
	opacity: 0;
	animation: 1s ease-out 0s 1 slideUpOnLoad;
	animation-fill-mode: forwards;
}
#show-more {
	$height: 20px;
	height: $height * 2 + 10px;
	width: 100%;
	text-align: center;
	font-weight: 100;
	cursor: pointer;
	position: relative;
	opacity: 1;
	box-sizing: content-box;
	color: #fff;
	transition: all 0.2s ease-in;
	span {
		height: $height;
		transition: all 0.2s ease-in;
		display: block;
		line-height: $height;
	}
	&:hover::before {
		top: $height + 2px;
	}
	&::before {
		transition: all 0.2s ease-in;
		right: 50%;
		margin-right: -10px;
		top: $height;
		height: $height;
	}
	&.opened {
		span {
			padding-top: $height;
		}
		&::before {
			transform: scaleY(-1);
			top: 0;
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
}
.email {
	display: flex;
	align-items: center;
	filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.3));
	> input {
		transition: all 0.2s ease-in;
		&:focus {
			outline: none;
		}
		&[type='email'] {
			height: 44px;
			padding: 5px 35px 5px 20px;
			font-size: 18px;
			width: 100%;
			border-width: 0px;
			border-radius: 22px 0 0 22px;
		}
		&[type='submit'] {
			background-image: url('/wp-content/themes/nextcloud.com/assets/img/arrow_right.svg');
			background-position: calc(100% - 20px) center;
			background-repeat: no-repeat;
		}
	}
	> .btn-primary {
		padding: 10px 60px 10px 20px;
		height: 44px;
		margin-left: -25px;
		&:hover {
			background-position: calc(100% - 10px) center;
		}
	}
	&.icon-loading-small-dark {
		&::after {
			left: calc(100% - 32px);
			box-sizing: content-box;
		}
		> input {
			&[type='email'] {
				width: 0;
				padding: 0;
			}
			&[type='submit'] {
				margin-left: 0;
				width: 100%;
				background-image: none;
				text-align: left;
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
