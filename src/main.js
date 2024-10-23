import Vue from 'vue'
import Register from './Register.vue'
import './assets/apps.scss'

const RegisterComponent = Vue.extend(Register)
new RegisterComponent().$mount('#register')
