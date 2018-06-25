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
			<div class="provider-logo" :style="{backgroundImage: 'url(' + provider.logo + ')'}" ></div>
			<h3>{{provider.name}}</h3>
			<p class="summary">{{provider.details}}</p>
			<div class="location">
				<span class="country">
					<span v-for="(country, key) in provider.flags" :key="key"
						:title="country"
						:class="'flag-'+country"/>
				</span>
				<span class="city">{{provider.city}}</span>
				<span class="distance">{{distance}}</span>
			</div>
			<div class="apps">
				<!-- core is un-removable -->
				<span title="Files" height="16" width="16"
					class="app-core"></span>
				<span v-for="(app, key) in provider.apps" :key="key"
					:title="app" height="16" width="16" v-if="officialApps.indexOf(app)>=0"
					:class="'app-'+app"></span>
			</div>
		</template>

	</div>
</template>
<script>
import VueScrollTo from 'vue-scrollto';
import { ContentLoader } from 'vue-content-loader';

export default {
	name: 'provider',
	props: ['provider', 'show', 'init', 'l10n'],
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
			if (this.provider.score <= 100) {
				return '< 100km';
			} else if (this.provider.score <= 1000) {
				return this.provider.score + 'km';
			} else {
				return this.l10n.far;
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
				document.getElementById('emailprovider').focus();
				return;
			}
			this.selected = this.provider;
			this.showAll = !this.showAll;
			VueScrollTo.scrollTo('#register', 500, { offset: -50 });
			document.getElementById('emailprovider').focus();
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
	display: -ms-grid !important;
	display: grid !important;
	grid-template-columns: 75px 1fr auto;
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
		width: 560px;
	}
	.provider-logo {
		width: 75px;
		height: 95px;
		grid-row: span 3;
		-ms-grid-row-span: 3;
		background: transparent no-repeat center/contain;
		grid-column: 1;
		-ms-grid-column: 1;
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
		grid-column: 2;
		grid-row: 1;
		-ms-grid-column: 2;
		-ms-grid-row: 1;
	}
	p.summary {
		font-weight: 100;
		opacity: 0.9;
		line-height: 1.2em;
		max-height: 2.4em; /* two lines */
		margin-top: 0;
		color: #555;
		grid-column: 2;
		grid-row: 2;
		-ms-grid-column: 2;
		-ms-grid-row: 2;
		/* line clamping now supported by all
		   we also have a js fallback */
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.location {
		display: flex;
		flex-direction: column;
		text-align: right;
		grid-column: 3;
		-ms-grid-column: 3;
		// h3 + p + apps
		grid-row: span 3;
		-ms-grid-row-span: 3;
		span {
			display: flex;
			height: 25px;
			align-items: center;
			justify-content: flex-end;
			white-space: nowrap;
		}
		> span:not(.country) {
			opacity: 0.5;
		}
		.country span {
			margin-left: 5px;
			display: block;
		}
	}
	.apps {
		flex: 0 0 100%;
		display: flex;
		grid-column: 2;
		grid-row: 3;
		-ms-grid-column: 2;
		-ms-grid-row: 3;
		span {
			margin-right: 5px;
			opacity: 0.5;
		}
	}
}
</style>
