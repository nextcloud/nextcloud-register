import Vue from 'vue'
import Register from './Register.vue'
import './assets/apps.scss'

export const app = new Vue({
	el: '#register',
	render: h => h(Register),
})
