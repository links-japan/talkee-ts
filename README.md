# The talkee plugin

## Install

### NPM

```shell
npm install @links-japan/talkee
# or
yarn add @links-japan/talkee
```

### CDN

```html
<style
  href="https://unpkg.com/@links-japan/talkee@latest/umd/talkee.min.css"
></style>
<script src="https://unpkg.com/@links-japan/talkee@latest/umd/talkee.min.js"></script>
```

## init

```shell
yarn
```

## dev

run `python -m http.server 8084` in the directory and visit http://localhost:8084

or just run `yarn dev`

## build

```shell
yarn build
```

## publish npm package

```shell
yarn release
```

## pass env variables

please see .env.example

## refactor todo list

- [x] rewrite sort bar into a component
- [x] rewrite meta bar into a component
- [x] rewrite load more panel bar into a component
- [x] rewrite comment list bar into a component
- [x] rewrite sub-comment list bar into a component
- [x] rewrite paignation buttons into a component
- [x] rewrite editor mask into a component
- [ ] rewrite comment item into a component
- [ ] rewrite editor into a component
