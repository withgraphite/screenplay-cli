# Screenplay CLI

## About

The official CLI for Screenplay. To run, `screenplay install <xcode_project>` (also, simply running `screenplay` will show help).

## Developing

1. `yarn install`
2. `yarn build`
3. `yarn link`

You should now be able to call `screenplay` from the command line.

If you are a Screenplay developer, and you wish to develop this all in monologue, please run `yarn link` from within the xcodejs directory and then `yarn link xcodejs` in this directory.

## Publishing

To bump in Homebrew,

- https://docs.brew.sh/Formula-Cookbook
- https://docs.brew.sh/Node-for-Formula-Authors

To bump in NPM:

- Bump the version in the package
- `yarn publish`

## License

(c) Screenplay Studios Inc., 2020 - All Rights Reserved
