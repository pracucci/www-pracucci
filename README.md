# Marco Pracucci


### Dependencies


The `github-pages` gem contains Jekyll itself and all the plugins officially supported on Github Pages.

```
gem install github-pages
```

Until `github-pages` gem don't update `jekyll-sitemap` to at least 0.6.2, in order to avoid a nasty warning every time you reload the page, you can update the plugin to the latest version running:

```
gem install github-pages
```


### Local preview

```
jekyll serve --watch --baseurl ''
```

then open http://localhost:4000
