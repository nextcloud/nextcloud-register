<template>
  <div>
    {{this.providers}}
  </div>
</template>

<script>
import Vue from "vue";
import provider from "./Components/Provider";

export default {
	name: "app",
	components: {
		provider
	},
	mounted() {
		this.sortProvider(48.258101, 9.164655);
	},
	computed: {
		providers() {
			return [
				{
					name: "Provider 1",
					ll: [49.1972, -0.3268],
					city: "Caen",
					country: "France",
					apps: ["core", "contacts", "calendar", "spreed", "mail"]
				},
				{
					name: "Provider 2",
					ll: [48.8567, 2.3508],
					city: "Paris",
					country: "France",
					apps: ["core", "contacts", "calendar"]
				},
				{
					name: "Provider 3",
					ll: [47.198983, -1.445317],
					city: "Nantes",
					country: "France",
					apps: ["core", "contacts", "calendar", "mail"]
				}
			];
		}
	},
	methods: {
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
		sortProvider(latitude, longitude) {
			let mindif = 99999;
			this.providers.forEach((provider, index) => {
				let dif = this.pythagorasEquirectangular(
					latitude,
					longitude,
					provider.ll[0],
					provider.ll[1]
				);
				Vue.set(provider, "score", Math.round(dif));
			});
			this.providers.sort((a, b) => {
				return a.score - b.score;
			});
			console.log(this.providers);
		}
	}
};
</script>

<style lang="scss">
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

h1,
h2 {
	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
