![VANITY Logo](https://nikolaskama.me/content/images/2020/04/vanity_logo.png)

<div align="center">
	<a href="https://dev.to/meeshkan/weekly-metrics-for-your-github-repos-with-vanity-3jf7">
		Read the article
	</a>
	<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
	<a href="https://vanity.dev">
		Visit vanity.dev
	</a>
</div>

---

## Deployment

[![Deploy to Vercel](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/Meeshkan/vanity)

Alternatively, to deploy `vanity` manually:

#### 1. [Download `Vercel`](https://vercel.com/download)

```
~ ❯❯❯ npm install -g vercel
```

#### 2. Create GitHub App

[Follow these steps](https://developer.github.com/apps/building-github-apps/creating-a-github-app/) to create a GitHub App.

Make sure the callback URL is set to the [vercel alias](https://vercel.com/docs/configuration#project/alias) (or custom domain) that you are going to be using, plus the endpoint `/auth/github/callback` (i.e., `{DOMAIN}.now.sh/auth/github/callback`, such as `vanity.meeshkan.now.sh/auth/github/callback`).

Additionally, change the "Administration" *repository* permissions and "Email addresses" *user* premissions to read-only access.

#### 3. Start `Redis` and `PostgreSQL` instances

You can use Heroku (i.e., [Heroku Postgres](https://www.heroku.com/postgres) and [Heroku Redis](https://www.heroku.com/redis)) or any other service of your choice.

#### 4. Set `vercel secrets`

Use the [`vercel secrets`](https://vercel.com/docs/v2/build-step#adding-secrets) command to create a 'secret' for each of the environment variables found in `.env.example`, in the format specified in the `vercel.json` file. For example, to create a secret for the `GITHUB_CLIENT_ID` variable, use the following command:

```
~ ❯❯❯ vercel secret add @vanity-github-client-id <GITHUB_CLIENT_ID>
```

#### 5. Deploy to `Vercel`

```
~/vanity ❯❯❯ vercel
```

#### 6. Create an alias

Use the `vercel alias` command to create your alias.

## Development

#### 1. Start `Redis` and `PostgreSQL` instances

If you're using Docker, run:

```
~/vanity ❯❯❯ docker-compose up -d
~/vanity ❯❯❯ # docker-compose down  # Teardown when done
```

#### 2. Create GitHub App

[Follow these steps](https://developer.github.com/apps/building-github-apps/creating-a-github-app/) to create a GitHub App. Make sure the callback URL is set to `http://localhost:3000/auth/github/callback`. Finally, change the "Administration" repository permissions to read-only access and "Email addresses" user premissions to read-only access as well.

#### 3. Create `.env`

Create a `.env` file and populate it with the environment variables specified in the `.env.example` file.

#### 4. Start development instance

Finally, execute:

```
~/vanity ❯❯❯ vercel dev
```

## License

MIT © [Meeshkan](http://meeshkan.com/)
