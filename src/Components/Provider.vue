<template>
	<!-- do not show selected -->
	<div class="provider" :style="{order:order}"
		 @click="selectProvider" v-if="selected !== provider || show">
		<h3>{{provider.name}}</h3>
		<p class="summary">{{provider.details}}</p>
		<div class="location">
			<span class="country">
				<img v-for="(country, key) in provider.flags" :key="key"
					 :alt="country" :title="country"
					 :src="'/wp-content/themes/nextcloud.com/assets/img/flags/'+country+'.gif'"/>
			</span>
			<span class="city">{{provider.city}}</span>
			<span class="distance">{{distance}}</span>
		</div>
		<div class="apps">
			<!-- core is un-removable -->
			<img alt="Files" height="16" width="16"
				 src="/wp-content/themes/nextcloud.com/assets/img/apps/core.svg"/>
			<img v-for="(app, key) in provider.apps" :key="key"
				 :alt="app" height="16" width="16" v-if="officialApps.indexOf(app)>=0"
				 :src="'/wp-content/themes/nextcloud.com/assets/img/apps/'+app+'.svg'"/>
		</div>
	</div>
</template>
<script>
import VueScrollTo from 'vue-scrollto';

export default {
	name: 'provider',
	props: ['provider', 'show'],
	methods: {},
	data() {
		return {
			officialApps: ['contacts', 'calendar', 'spreed', 'mail', 'tasks']
		};
	},
	computed: {
		distance() {
			if (
				this.provider.score <= 500 &&
				typeof this.provider.score === 'number'
			) {
				return this.provider.score + 'km';
			} else {
				return 'Far far away';
			}
		},
		selected: {
			get() {
				return this.$parent.selected;
			},
			set(provider) {
				this.$parent.selected = provider;
			}
		},
		showAll: {
			get() {
				return this.$parent.showAll;
			},
			set(showAll) {
				this.$parent.showAll = showAll;
			}
		},
		order() {
			// selected is first
			if (this.selected === this.provider) {
				return -1;
			}
			return this.provider.score;
		}
	},
	methods: {
		selectProvider() {
			if (this.selected === this.provider) {
				return;
			}
			this.selected = this.provider;
			this.showAll = !this.showAll;
			VueScrollTo.scrollTo('#register', 500, {offset: -50});
			window.emailprovider.focus()
		}
	}
};
</script>

<style lang='scss' scoped>
.provider {
	background: #fff;
	margin: 10px;
	padding: 10px;
	position: relative;
	padding-right: 110px;
	// override display block after animation
	display: flex !important;
	flex-wrap: wrap;
	flex-shrink: 0;
	border-radius: 5px;
	user-select: none;
	flex-direction: column;
	transition: all 0.2s ease-in;
	&:not(.selected-provider) {
		cursor: pointer;
		filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
		&:hover {
			filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
		}
	}
	h3 {
		margin: 0;
		flex-grow: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 22px;
	}
	p.summary {
		font-weight: 100;
		opacity: 0.9;
		line-height: 1.2em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: justify;
		margin-top: 0;
	}
	.location {
		display: flex;
		flex-direction: column;
		text-align: right;
		opacity: 0.7;
		position: absolute;
		top: 10px;
		right: 10px;
		span {
			display: flex;
			height: 25px;
			align-items: center;
			justify-content: flex-end;
		}
		.country img {
			margin-left: 5px;
		}
	}
	.apps {
		flex: 0 0 100%;
		display: flex;
		img {
			margin-right: 5px;
			opacity: 0.5;
		}
	}
}
</style>
