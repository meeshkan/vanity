# vanity

- Weekly metrics for your GitHub repos.

## Deployment

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/Meeshkan/vanity)

Alternatively, to deploy `vanity` manually:

First, [download `now`](https://zeit.co/download):
```
~ ❯❯❯ npm install -g now
```

Use the [`now secrets`](https://zeit.co/docs/v2/build-step#adding-secrets) command to create a 'secret' for each of the environment variables, in the format specified in `now.json`. For example, to create a secret for the `GITHUB_CLIENT_ID` variable, use the following command:
```
~ ❯❯❯ now secret add @vanity-github-client-id <GITHUB_CLIENT_ID>
```

Finally, run `now` from *within* the `vanity` directory:
```
~/vanity ❯❯❯ now
```

## Development

Firstly, start your own `Redis` and `PostgreSQL` instances. If you're using Docker, run

```bash
docker-compose up -d
# docker-compose down  # Teardown when done
```

Subsequently, create a `.env` file and populate it with the environment variables specified in the `.env.example` file.

Finally, you can run a local deployment of `vanity` by executing the following:
```
~/vanity ❯❯❯ now dev
```

## Credits

## License

MIT © [Meeshkan](http://meeshkan.com/)

## TODO:

- [ ] Migrate to TypeScript.
- [x] Fix weekly `sendEmail` job.
- [x] Re-design email template (using [EJS](https://github.com/mde/ejs)).
- [x] Create README documentation.
- [ ] Create backend unit tests (using `supertest`).
- [ ] Create integration tests (using `cypress`).
- [x] Configure `Sentry`.
- [x] Setup [`NextSEO`](https://github.com/garmeeh/next-seo).
- [ ] Break commonly used React code into components (especially SVGs).
- [ ] Create custom error pages (i.e., create `pages/_error.js` file).
- [x] Host Postgres & Redis DBs on Heroku (and configure links).
- [x] Use AVA linter.
- [x] Configure CircleCI to run tests.
- [ ] Create and configure favicon.
- [ ] Implement unsubscribe button.
- [ ] Configure logger.
