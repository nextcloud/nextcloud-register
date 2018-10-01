all: dev-setup lint build-js-production

# Dev env management
dev-setup: clean clean-dev npm-init

npm-init:
	npm install

npm-update:
	npm update

# Building
build-js:
	npm run dev

build-js-production:
	npm run build

watch-js:
	npm run watch

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Cleaning
clean:
	rm -f ../assets/js/pages/signup.js
	rm -f ../assets/js/pages/signup.js.map

clean-dev:
	rm -rf node_modules

