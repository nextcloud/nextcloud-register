# nextcloud-register

> This is the app that manages the single signup process on [nextcloud.com](https://nextcloud.com)
1. clone and setup https://github.com/nextcloud/nextcloud.com
2. create a preferred.json file and setup the config.php with the correct data
3. on the [nextcloud theme](https://github.com/nextcloud/nextcloud.com) folder, clone this repository
4. build

## Build Setup

``` bash
# fully build this app
make

# install dependencies and setup env
make dev-setup

# build for production
make build-js-production

# build for dev
make build-js

# build and watch changes
make watch-js
```
