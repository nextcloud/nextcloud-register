<template>
	<!-- do not show selected -->
	<div v-if="selected !== provider || show" :style="{order:order}"
		class="provider" @click="selectProvider"
	>

		<!-- loading svg while computing closest provider -->
		<template v-if="!init">
			<content-loader
				:height="75"
				:width="460"
				:speed="2"
				primary-color="#bbb"
				secondary-color="#ccc"
			>
				<!-- h3 -->
				<rect x="0" y="0" rx="3"
					ry="3" width="150" height="22"
				/>
				<!-- p -->
				<rect x="0" y="30" rx="3"
					ry="3" width="200" height="16"
				/>
				<!-- apps -->
				<rect x="0" y="59" rx="3"
					ry="3" width="50" height="16"
				/>
				<!-- flags -->
				<rect x="444" y="6" rx="1"
					ry="1" width="16" height="11"
				/>
				<rect x="423" y="6" rx="1"
					ry="1" width="16" height="11"
				/>
				<rect x="402" y="6" rx="1"
					ry="1" width="16" height="11"
				/>
				<!-- city -->
				<rect x="410" y="30" rx="3"
					ry="3" width="50" height="16"
				/>
				<!-- distance -->
				<rect x="420" y="53" rx="3"
					ry="3" width="40" height="16"
				/>
			</content-loader>
		</template>

		<!-- default template if all data loaded -->
		<template v-else>
			<div :style="{backgroundImage: 'url(' + provider.logo + ')'}" class="provider-logo" />
			<h3>{{ provider.name }}</h3>
			<p class="summary">{{ provider.details }}</p>
			<div class="details">
				<span class="country">
					<span v-for="(country, key) in provider.flags" :key="key"
						:title="country"
						:class="'flag-icon-'+country"
					/>
				</span>
				<span class="city">{{ provider.city }}</span>
				<span class="distance">{{ distance }}</span>
				<span class="freeplan">{{ provider.freeplan }}</span>
			</div>
			<div class="apps">
				<span v-for="(app, key) in coreApps" :key="`core-${key}`" v-tooltip.bottom="officialApps[app]"
					:class="['app-'+app, { first: key === 0, last: key === coreApps.length - 1 }]" class="core"
				/>
				<template>
					<span v-for="(app, key) in apps" :key="`app-${key}`"
						v-tooltip.bottom="officialApps[app]" :class="'app-'+app"
					/>
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
		ContentLoader
	},
	props: {
		provider: {
			type: Object,
			default: () => {}
		},
		show: {
			type: Boolean,
			default: true
		},
		init: {
			type: Boolean,
			default: true
		},
		l10n: {
			type: Object,
			default: () => {}
		},
		officialApps: {
			type: Object,
			default: () => []
		},
		coreApps: {
			type: Array,
			default: () => []
		}
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
			if (this.provider.score <= 1000) {
				// rounding to the hundred
				return '< ' + Math.round(this.provider.score / 100) * 100 + 'km'
			} else {
				return this.l10n.far
			}
		},
		selected: {
			get() {
				return this.$parent.selected
			},
			set(provider) {
				this.$parent.selected = provider
			}
		},
		showAll: {
			get() {
				return this.$parent.showAll
			},
			set(showAll) {
				this.$parent.showAll = showAll
			}
		},
		order() {
			// selected is first
			if (this.selected === this.provider) {
				return -1
			}
			return this.provider.score
		}
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
		}
	}
}
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
	grid-template-columns: 75px 1fr;
	-ms-grid-columns: 75px 1fr;
	grid-template-rows: 25px 50px;
	-ms-grid-rows: 25px 50px;
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
		color: #555;
		grid-column: 2;
		grid-row: 1;
		-ms-grid-column: 2;
		-ms-grid-row: 1;
	}
	p.summary {
		font-weight: 100;
		opacity: .9;
		line-height: 25px;
		max-height: 50px; /* two lines */
		margin: 0;
		color: #555;
		grid-column: 2;
		grid-row: 2;
		-ms-grid-column: 2;
		-ms-grid-row: 2;
		// line clamping now supported by all
		// we also have a js fallback
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.details {
		display: flex;
		flex-direction: column;
		text-align: right;
		grid-column: 3;
		-ms-grid-column: 3;
		// h3 + p + apps
		grid-row: span 3;
		-ms-grid-row-span: 3;
		opacity: .9;
		span {
			font-weight: 100;
			display: flex;
			height: 25px;
			align-items: center;
			justify-content: flex-end;
			white-space: nowrap;
		}
		.country span {
			margin-left: 5px;
			display: block;
			width: 20px;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
	}
	.apps {
		flex: 0 0 100%;
		flex-wrap: wrap;
		display: flex;
		grid-column: 2;
		grid-row: 3;
		-ms-grid-column: 2;
		-ms-grid-row: 3;
		margin-left: -3px; // align the first icon to the text
		span {
			background-position: center center;
			opacity: 0.5;
			height: 25px;
			width: 25px;
			max-width: 25px;
			min-width: 18px;
			flex: 1 1 18px;
			&.core {
				opacity: 1;
				background-color: #0082c9;
				&.first {
					display: flex;
					margin-left: 3px;
					&::before {
						content: '';
						border-radius: 3px 0 0 3px;
						width: 3px;
						margin-left: -3px;
						background-color: inherit;
					}
				}
				&.last {
					display: flex;
					margin-right: 3px;
					&::after {
						content: '';
						border-radius: 0 3px 3px 0;
						width: 3px;
						margin-left: 100%;
						margin-right: -3px;
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
	background: #fff;
	filter: drop-shadow(0 1px 4px rgba(0,0,0,.6));
	border: solid 1px #f1f1f1;
	border-radius: 4px;
	transform-origin: left top;
	will-change: transform;
	position: absolute;
	z-index: 5;
	top: 100%;
	font-size: 15px;
	padding: 5px;
	user-select: none;
	&::before {
		content: "";
		position: absolute;
		top: 100%;
		left: 50%;
		right: auto;
		transform: translateX(-50%);
		height: 0;
		width: 0;
		border: 8px solid transparent;
		border-top-color: #f1f1f1;
	}
	&[x-placement='bottom']::before {
		bottom: 100%;
		top: auto;
		border-top-color: transparent;
		border-bottom-color: #f1f1f1;
	}
}
</style>
