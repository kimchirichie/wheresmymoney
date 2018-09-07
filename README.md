# Building production package

Run the following command to build production tarball

```sh
$ meteor build /output/path --server-only
```

# Export settings on production

Settings has to be set with env var. Use the settings JSON file to get settings.

```sh
$ export METEOR_SETTINGS="$(cat settings.json)"
```

# Unpack and run server

Unpack, install packages, and run forever

```sh
$ tar -xzf foodoughh.tar.gz
$ (cd bundle/programs/server && npm install)
$ forver start bundle/main.js
```
