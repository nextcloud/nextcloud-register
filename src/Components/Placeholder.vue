<template>
	<ContentLoader :height="75"
		:width="460"
		:speed="2"
		primary-color="#bbb"
		secondary-color="#ccc">
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
	</ContentLoader>
</template>

<script>
import { ContentLoader } from 'vue-content-loader';
export default {
	name: 'Placeholder',

	components: {
		ContentLoader,
	},
};
</script>
