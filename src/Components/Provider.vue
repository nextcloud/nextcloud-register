<template>
	<!-- do not show selected -->
	<div v-if="selected !== provider || show"
		:style="{ order }"
		class="provider"
		@click="selectProvider">
		<!-- loading svg while computing closest provider -->
		<template v-if="!init">
			<ContentLoader
				:height="75"
				:width="460"
				:speed="2"
				primary-color="#bbb"
				secondary-color="#ccc">
				<!-- h3 -->
				<rect x="0"
					y="0"
					rx="3"
					ry="3"
					width="150"
					height="22" />
				<!-- p -->
				<rect x="0"
					y="30"
					rx="3"
					ry="3"
					width="200"
					height="16" />
				<!-- apps -->
				<rect x="0"
					y="59"
					rx="3"
					ry="3"
					width="50"
					height="16" />
				<!-- flags -->
				<rect x="444"
					y="6"
					rx="1"
					ry="1"
					width="16"
					height="11" />
				<rect x="423"
					y="6"
					rx="1"
					ry="1"
					width="16"
					height="11" />
				<rect x="402"
					y="6"
					rx="1"
					ry="1"
					width="16"
					height="11" />
				<!-- city -->
				<rect x="410"
					y="30"
					rx="3"
					ry="3"
					width="50"
					height="16" />
				<!-- distance -->
				<rect x="420"
					y="53"
					rx="3"
					ry="3"
					width="40"
					height="16" />
			</ContentLoader>
		</template>

		<!-- default template if all data loaded -->
		<template v-else>
			<div :style="{backgroundImage: 'url(' + provider.logo + ')'}" class="provider-logo" />
			<h3>{{ provider.name }}</h3>
			<p class="summary">
				{{ provider.details }}
			</p>
			<div class="details">
				<span class="country">
					<span v-for="(country, key) in provider.flags"
						:key="key"
						:title="country"
						:class="'flag-icon-'+country" />
				</span>
				<span class="city">
					{{ city }}
				</span>
				<span class="distance">
					{{ distance }}
				</span>
				<span class="freeplan">
					{{ provider.freeplan }}
				</span>
			</div>
			<div class="apps">
				<span v-for="(app, key) in coreApps"
					:key="`core-${key}`"
					v-tooltip.bottom="officialApps[app]"
					:class="['app-'+app, { first: key === 0, last: key === coreApps.length - 1 }]"
					class="core" />
				<template>
					<span v-for="(app, key) in apps"
						:key="`app-${key}`"
						v-tooltip.bottom="officialApps[app]"
						:class="'app-'+app" />
				</template>
			</div>
		</template>
	</div>
</template>
<script>
import VueScrollTo from 'vue-scrollto'
import VTooltip from 'v-tooltip'
import { ContentLoader } from 'vue-content-loader'
import Vue from 'vue'

Vue.use(VTooltip)

VTooltip.options.autoHide = false

export default {
	name: 'Provider',
	components: {
		ContentLoader,
	},
	props: {
		provider: {
			type: Object,
			default: () => {},
		},
		show: {
			type: Boolean,
			default: true,
		},
		init: {
			type: Boolean,
			default: true,
		},
		l10n: {
			type: Object,
			default: () => {},
		},
		officialApps: {
			type: Object,
			default: () => [],
		},
		coreApps: {
			type: Array,
			default: () => [],
		},
	},
	computed: {
		apps() {
			return this.provider.apps.slice(0)
				.filter(app => this.officialApps.hasOwnProperty(app))
				.sort(function(a, b) {
					return a.localeCompare(b)
				})
		},
		distance() {
			// Don't display distance bigger than 1000km
			if (this.locations[0].score <= 1000) {
				// rounding to the hundred
				return '< ' + Math.round(this.locations[0].score / 100) * 100 + 'km'
			} else {
				return this.l10n.far
			}
		},
		locations() {
			return this.provider.locations.slice().sort((a, b) => a.score - b.score)
		},
		city() {
			return this.locations[0].city
		},
		selected: {
			get() {
				return this.$parent.selected
			},
			set(provider) {
				this.$parent.selected = provider
			},
		},
		showAll: {
			get() {
				return this.$parent.showAll
			},
			set(showAll) {
				this.$parent.showAll = showAll
			},
		},
		order() {
			// selected is first
			if (this.selected === this.provider) {
				return -1
			}
			return this.locations[0].score
		},
	},
	methods: {
		selectProvider() {
			if (this.selected === this.provider) {
				document.getElementById('emailprovider').focus()
				return
			}
			this.selected = this.provider
			this.showAll = !this.showAll
			VueScrollTo.scrollTo('#register', 500, { offset: -50 })
			document.getElementById('emailprovider').focus()
		},
	},
}
</script>

<style lang='scss' scoped>
.provider {
	position: relative;
	// override display block after animation

	display: -ms-grid !important;
	display: grid !important;

	margin: 10px;
	padding: 10px;

	user-select: none;
	transition: all .2s ease-in;

	border-radius: 5px;
	background: #fff;

	grid-template-columns: 75px 1fr;
	-ms-grid-columns: 75px 1fr;
	grid-template-rows: 25px 50px;
	-ms-grid-rows: 25px 50px;
	grid-auto-flow: column;
	grid-column-gap: 10px;
	&:not(.selected-provider) {
		cursor: pointer;

		filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .4));
		&:hover {
			filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .5));
		}
	}
	// loading svg
	svg {
		width: 560px;
	}
	.provider-logo {
		width: 75px;

		background: transparent no-repeat center/contain;

		grid-row: span 3;
		-ms-grid-row-span: 3;
		grid-column: 1;
		-ms-grid-column: 1;
	}
	h3 {
		overflow: hidden;
		flex-grow: 1;

		margin: 0;

		white-space: nowrap;
		text-overflow: ellipsis;

		color: #555;

		font-size: 22px;
		line-height: 22px;

		grid-column: 2;
		grid-row: 1;
		-ms-grid-column: 2;
		-ms-grid-row: 1;
	}
	p.summary {
		display: -webkit-box;
		// line clamping now supported by all
		// we also have a js fallback
		overflow: hidden;
		-webkit-box-orient: vertical;

		max-height: 50px; /* two lines */
		margin: 0;

		text-overflow: ellipsis;

		opacity: .9;
		color: #555;

		font-weight: 100;
		line-height: 25px;

		grid-column: 2;
		grid-row: 2;
		-ms-grid-column: 2;
		-ms-grid-row: 2;
		-webkit-line-clamp: 2;
	}
	.details {
		display: flex;
		flex-direction: column;

		text-align: right;

		opacity: .9;

		grid-column: 3;
		-ms-grid-column: 3;
		// h3 + p + apps
		grid-row: span 3;
		-ms-grid-row-span: 3;
		span {
			display: flex;
			align-items: center;
			justify-content: flex-end;

			height: 25px;

			white-space: nowrap;

			font-weight: 100;
		}
		.country span {
			display: block;

			width: 20px;
			margin-left: 5px;

			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
		}
	}
	.apps {
		display: flex;
		flex: 0 0 100%;
		flex-wrap: wrap;

		margin-left: -3px; // align the first icon to the text

		grid-column: 2;
		grid-row: 3;
		-ms-grid-column: 2;
		-ms-grid-row: 3;
		span {
			flex: 1 1 18px;

			width: 25px;
			min-width: 18px;
			max-width: 25px;
			height: 25px;

			opacity: .5;
			background-position: center center;
			&.core {
				opacity: 1;
				background-color: #0082c9;
				&.first {
					display: flex;
					margin-left: 3px;
					&::before {
						width: 3px;
						margin-left: -3px;

						content: '';

						border-radius: 3px 0 0 3px;
						background-color: inherit;
					}
				}
				&.last {
					display: flex;
					margin-right: 3px;
					&::after {
						width: 3px;
						margin-right: -3px;
						margin-left: 100%;

						content: '';

						border-radius: 0 3px 3px 0;
						background-color: inherit;
					}
				}
			}
		}
	}
}

</style>
<style lang="scss">
.vue-tooltip-theme {
	position: absolute;
	z-index: 5;
	top: 100%;

	padding: 5px;

	user-select: none;
	transform-origin: left top;

	border: solid 1px #f1f1f1;
	border-radius: 4px;
	background: #fff;

	font-size: 15px;

	filter: drop-shadow(0 1px 4px rgba(0,0,0,.6));
	will-change: transform;
	&::before {
		position: absolute;
		top: 100%;
		right: auto;
		left: 50%;

		width: 0;
		height: 0;

		content: '';
		transform: translateX(-50%);

		border: 8px solid transparent;
		border-top-color: #f1f1f1;
	}
	&[x-placement='bottom']::before {
		top: auto;
		bottom: 100%;

		border-top-color: transparent;
		border-bottom-color: #f1f1f1;
	}
}

</style>
