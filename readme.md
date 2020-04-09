# vanity

> Weekly metrics for your GitHub repos.

## Deployment

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/Meeshkan/vanity)

Alternatively, to deploy `vanity` manually:

#### 1. [Download `now`](https://zeit.co/download)

```
~ ❯❯❯ npm install -g now
```

#### 2. Create GitHub OAuth application

[Follow these steps](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/) to create a GitHub OAuth app.

Make sure the callback URL is set to the [now alias](https://zeit.co/docs/configuration#project/alias) (or custom domain) that you are going to be using, plus the endpoint `/auth/github/callback` (i.e., `{DOMAIN}.now.sh/auth/github/callback`, such as `vanity.meeshkan.now.sh/auth/github/callback`).

#### 3. Start `Redis` and `PostgreSQL` instances

You can use Heroku (i.e., [Heroku Postgres](https://www.heroku.com/postgres) and [Heroku Redis](https://www.heroku.com/redis)) or any other service of your choice.

#### 4. Set `now secrets`

Use the [`now secrets`](https://zeit.co/docs/v2/build-step#adding-secrets) command to create a 'secret' for each of the environment variables found in `.env.example`, in the format specified in the `now.json` file. For example, to create a secret for the `GITHUB_CLIENT_ID` variable, use the following command:

```
~ ❯❯❯ now secret add @vanity-github-client-id <GITHUB_CLIENT_ID>
```

#### 5. Deploy to `now`

```
~/vanity ❯❯❯ now
```

#### 6. Create an alias

Use the `now alias` command to create your alias.

## Development

#### 1. Start `Redis` and `PostgreSQL` instances

If you're using Docker, run:

```
~/vanity ❯❯❯ docker-compose up -d
~/vanity ❯❯❯ # docker-compose down  # Teardown when done
```

#### 2. Create GitHub OAuth application

[Follow these steps](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/) to create a GitHub OAuth app. Make sure the callback URL is set to `http://localhost:3000/auth/github/callback`.

#### 3. Create `.env`

Create a `.env` file and populate it with the environment variables specified in the `.env.example` file.

#### 4. Start development instance

Finally, execute:

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
- [x] Create backend unit tests (using `supertest`).
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
