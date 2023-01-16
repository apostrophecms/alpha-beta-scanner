# alpha-beta-scanner

Scans your github organization or personal account for projects whose current `package.json` file declares them to be of `alpha` or `beta` quality. Version numbers starting with `0.` are also reported.

## Why?

We ship lots of open source software. Sometimes changes are needed before we declare it to be stable. Other times, a year will pass and nobody notices it's still considered "beta." This tool to the rescue.

## Install
```bash
npm install -g alpha-beta-scanner
```

## Use

```bash
alpha-beta-scanner --user=myusername

alpha-beta-scanner --org=myorgname

# If you run out of API requests, or want to scan private repos,
# use a github personal access token
alpha-beta-scanner --org=myorgname --token=go-get-your-own
```

You can also use the `TOKEN` environment variable.

Note: this tool wants your github.com username or organization name. It doesn't scan `npm` directly.
