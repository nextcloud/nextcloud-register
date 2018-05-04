<template>
	<!-- do not show selected -->
	<div class="provider" :style="{order:order}"
		 @click="selectProvider" v-if="selected !== provider || show">

		<!-- loading svg while computing closest provider -->
		<template v-if="!init">
			<content-loader
				:height="75"
				:width="460"
				:speed="2"
				primaryColor="#bbb"
				secondaryColor="#ccc"
			>
				<!-- h3 -->
				<rect x="0" y="0" rx="3" ry="3" width="150" height="22" /> 
				<!-- p -->
				<rect x="0" y="30" rx="3" ry="3" width="200" height="16" /> 
				<!-- apps -->
				<rect x="0" y="59" rx="3" ry="3" width="50" height="16" /> 
				<!-- flags -->
				<rect x="444" y="6" rx="1" ry="1" width="16" height="11" /> 
				<rect x="423" y="6" rx="1" ry="1" width="16" height="11" /> 
				<rect x="402" y="6" rx="1" ry="1" width="16" height="11" /> 
				<!-- city -->
				<rect x="410" y="30" rx="3" ry="3" width="50" height="16" /> 
				<!-- distance -->
				<rect x="420" y="53" rx="3" ry="3" width="40" height="16" />
			</content-loader>
		</template>

		<!-- default template if all data loaded -->
		<template v-else>
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
		</template>

	</div>
</template>
<script>
import VueScrollTo from 'vue-scrollto';
import { ContentLoader } from 'vue-content-loader';

export default {
	name: 'provider',
	props: ['provider', 'show', 'init'],
	components: {
		ContentLoader
	},
	data() {
		return {
			officialApps: ['contacts', 'calendar', 'spreed', 'mail', 'tasks']
		};
	},
	computed: {
		distance() {
			// Don't display distance bigger than 1000km
			if (
				this.provider.score <= 1000 &&
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
				window.emailprovider.focus();
				return;
			}
			this.selected = this.provider;
			this.showAll = !this.showAll;
			VueScrollTo.scrollTo('#register', 500, { offset: -50 });
			window.emailprovider.focus();
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
	// override display block after animation
	display: grid !important;
	grid-template-columns: 1fr auto;
	grid-auto-flow: column;
	grid-column-gap: 10px;
	border-radius: 5px;
	user-select: none;
	transition: all 0.2s ease-in;
	&:not(.selected-provider) {
		cursor: pointer;
		filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
		&:hover {
			filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
		}
	}
	// loading svg
	svg {
		width: 460px;
	}
	h3 {
		margin: 0;
		flex-grow: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 22px;
		line-height: 22px;
		margin-bottom: 6px;
		color: #555;
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
		color: #555;
	}
	.location {
		display: flex;
		flex-direction: column;
		text-align: right;
		opacity: 0.7;
		grid-column: 3;
		// h3 + p + apps
		grid-row: span 3;
		span {
			display: flex;
			height: 25px;
			align-items: center;
			justify-content: flex-end;
			white-space: nowrap;
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
