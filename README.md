## Gorriato Logger
This is the companion Logger app for the GorriatoQRP Series transceivers.
It is a simple to understand logbook, with capability of upload to eqsl.
<img width="804" height="432" alt="image" src="https://github.com/user-attachments/assets/5507379e-00fd-4e4e-8556-9a3d178d1560" />

The application is available for Unix and Windows environments(macOS experimental)
The core is basically a web browser embedded on a process, so its not really a desktop app per se, but a webapp served locally with an embedded browser.
The eQSL Password is securely saved on the system, it is only used when uploading the logs. It is also optional, you can opt to use it every time 
a log is uploaded and the password won't be stored by GorriatoLogger.(Note that eQSL is suspicious of sending passwords in clear text)

Releases for direct installations will be the packages available to download in the Releases section(to be done).

## Usage
### Install Dependencies

```
$ cd logger

# using yarn or npm
$ yarn (or `npm install`)

# using pnpmmy-app
$ pnpm install --shamefully-hoist
```

### Use it

```
# development mode
$ yarn dev (or `npm run dev` or `pnpm run dev`)

# production build
$ yarn build (or `npm run build` or `pnpm run build`)
```
