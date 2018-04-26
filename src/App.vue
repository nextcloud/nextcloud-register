<template>
	<div id="register" class="container revealOnScroll">
		<provider :provider="selected" :show="true" class="selected-provider revealOnScroll" />
		<div id="show-more" class="button--dropdown revealOnScroll"
			 :class="{opened: showAll}" @click="toggleShowAll"><span>{{showAll ? 'close' : 'change provider'}}</span></div>
		<form id="form" class="revealOnScroll" @submit.prevent="register" ref="register">
			<div class="email">
				<input type="email" required value="" placeholder="Your email address" id="emailprovider" />
				<input type="submit" class="btn btn-primary" value="Sign Up" />
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
			showAll: false
		};
	},
	beforeMount() {
		let location = JSON.parse(window.register.dataset.ll);
		if (location.latitude && location.longitude) {
			//this.ll = [location.latitude, location.longitude];
		}
		this.scoreProvider(this.ll[0], this.ll[1]);
	},
	computed: {
		providers() {
			return [
				{
					name: 'Provider 1',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [49.1972, -0.3268],
					city: 'Caen',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar', 'spreed', 'mail']
				},
				{
					name: 'Provider 2',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [48.8567, 2.3508],
					city: 'Paris',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar']
				},
				{
					name: 'Provider 3',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [47.198983, -1.445317],
					city: 'Nantes',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar', 'mail']
				},
				{
					name: 'Provider 2',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [48.8567, 2.3508],
					city: 'Paris',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar']
				},
				{
					name: 'Provider 3',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [47.198983, -1.445317],
					city: 'Nantes',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar', 'mail']
				},
				{
					name: 'Provider 2',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [48.8567, 2.3508],
					city: 'Paris',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar']
				},
				{
					name: 'Provider 3',
					details:
						'This is a sample text to describe this provider. We deeply care about our customers and there data.',
					ll: [47.198983, -1.445317],
					city: 'Nantes',
					country: 'France',
					countryCode: 'fr',
					apps: ['core', 'contacts', 'calendar', 'mail']
				}
			];
		}
	},
	methods: {
		// submit
		register(event) {
			return false;
		},
		// toggle showAll
		toggleShowAll() {
			this.showAll = !this.showAll;
			VueScrollTo.scrollTo(!this.showAll ? '#register' : '#form', 500, {
				offset: -100
			});
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
			this.providers.forEach((provider, index) => {
				let dif = this.pythagorasEquirectangular(
					latitude,
					longitude,
					provider.ll[0],
					provider.ll[1]
				);
				if (dif < mindif) {
					mindif = dif;
					this.selected = provider;
				}
				this.$set(provider, 'score', Math.round(dif));
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
}
#providers {
	display: flex;
	flex-direction: column;
	max-width: 500px;
	margin: auto;
	margin-top: 20px;
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
}
#form {
	top: 30vh;
	width: 100%;
	padding: 0 10px;
}
.email {
	display: flex;
	align-items: center;
	filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
	> input {
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
}
</style>
