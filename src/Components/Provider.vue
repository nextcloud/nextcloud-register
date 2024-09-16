<template>
	<!-- Show loading placeholder if not initialized -->
	<div v-if="!initialized" class="provider provider--initialized">
		<!-- loading svg while computing closest provider -->
		<Placeholder />
	</div>

	<!-- Do not show selected -->
	<div v-else-if="selected !== provider || show"
		:style="{ order }"
		class="provider"
		@click="selectProvider">
		<!-- Provider -->
		<div :style="{backgroundImage: 'url(' + provider.logo + ')'}" class="provider-logo" />
		<h3>{{ provider.name }}</h3>
		<p class="summary">
			{{ provider.details }}
		</p>

		<!-- Provider details -->
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

		<!-- Apps list -->
		<div class="apps">
			<span v-for="(app, key) in coreApps"
				:key="`core-${key}`"
				v-tooltip.bottom="officialApps[app]"
				:class="['app-'+app, { first: key === 0, last: key === coreApps.length - 1 }]"
				class="core" />
			<span v-for="(app, key) in apps"
				:key="`app-${key}`"
				v-tooltip.bottom="officialApps[app]"
				:class="'app-'+app" />
		</div>


	</div>
</template>
<script>
import Placeholder from './Placeholder.vue'
import VueScrollTo from 'vue-scrollto'
import VTooltip from 'v-tooltip'
import Vue from 'vue'

Vue.use(VTooltip)

VTooltip.options.autoHide = false

export default {
	name: 'Provider',

	components: {
		Placeholder,
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
		initialized: {
			type: Boolean,
			default: true,
		},
		l10n: {
			type: Object,
			default: () => ({}),
		},
		officialApps: {
			type: Object,
			default: () => ({}),
		},
		coreApps: {
			type: Array,
			default: () => [],
		},
		selected: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		apps() {
			return this.provider.apps.slice(0)
				.filter(app => Object.prototype.hasOwnProperty.call(this.officialApps, app))
				.sort(function(a, b) {
					return a.localeCompare(b)
				})
		},
		distance() {
			// Don't display distance bigger than 3000km
			if (this.locations[0]?.score <= 3000) {
				// rounding to the hundred
				return '< ' + Math.round(this.locations[0].score / 100) * 100 + 'km'
			} else {
				return this.l10n.far
			}
		},
		locations() {
			// Clone and sort locations
			return this.provider.locations.slice()
				.sort((a, b) => a.score - b.score)
		},
		city() {
			// Sorted locations, first is closest
			return this.locations[0]?.city || ''
		},
		order() {
			// selected is first
			if (this.selected) {
				return -1
			}
			return this.locations[0]?.score || 0
		},
	},

	methods: {
		selectProvider() {
			if (this.selected) {
				document.getElementById('emailprovider').focus()
				return
			}

			this.$emit('select')
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
	display: grid !important;
	margin: 10px;
	padding: 15px;
	user-select: none;
	transition: all .2s ease-in;
	border-radius: 15px;
	background: #fff;
	font-size: 15px;

	grid-template-columns: 75px 1fr;
	-ms-grid-columns: 75px 1fr;
	grid-template-rows: 25px 50px;
	-ms-grid-rows: 25px 50px;
	grid-auto-flow: column;
	grid-column-gap: 10px;

	&.selected-provider {
		// better align with checkboxes
		margin-top: 0;
	}

	&:not(.selected-provider) {
		cursor: pointer;

		filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .1));
		&:hover {
			filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .1));
		}
	}

	// loading svg
	&.provider--initialized {
		display: block !important;
		svg {
			width: 560px;
		}
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
	opacity: 1;

	filter: drop-shadow(0 3px 6px rgba(0,0,0,.3));
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
	.tooltip-inner {
		background: transparent !important;
		color: inherit;
	}
}

</style>