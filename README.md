# Building production package

Run the following command to export settings, and build production

```sh
$ export METEOR_SETTINGS="$(cat settings-development.json )"
$ meteor build /output/path --server-only
```

# Unpack and run server

Unpack, install packages, and run forever

```sh
$ tar -xzf moneyapp.tar.gz
$ (cd bundle/programs/server && npm install)
$ forver start bundle/main.js
```
