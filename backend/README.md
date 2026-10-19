<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## ローカルDB（Docker Compose + MySQL 8.4）

開発用のMySQLをDocker Composeで起動する。Prismaの導入・マイグレーションは次の工程で行う（現時点ではNestJSからDBへ接続しない）。

### 前提条件

- Docker Engine と Docker Compose v2（`docker compose version` が実行できること）
- ホストの `127.0.0.1:3307` が他のプロセスに使われていないこと

### `.env` の準備

```bash
cd backend
cp .env.example .env
```

`.env` の `MYSQL_PASSWORD` と `MYSQL_ROOT_PASSWORD` を自分の値に変更する。`DATABASE_URL` / `SHADOW_DATABASE_URL` 内のパスワードも `MYSQL_PASSWORD` と同じ値にする。`.env` はGitにコミットしない（`.gitignore`で除外済み。`.env.example` のみ管理対象）。

| 変数 | 用途 |
| --- | --- |
| `MYSQL_DATABASE` | アプリ用データベース名 |
| `MYSQL_SHADOW_DATABASE` | `prisma migrate dev` 用のShadow Database名 |
| `MYSQL_USER` / `MYSQL_PASSWORD` | アプリ・Prisma接続用の開発ユーザー |
| `MYSQL_ROOT_PASSWORD` | MySQLのrootパスワード（コンテナ初期化専用。アプリ接続には使わない） |
| `DATABASE_URL` | Prismaが使う接続URL |
| `SHADOW_DATABASE_URL` | Prismaが使うShadow Databaseの接続URL |

### 起動・確認・停止

```bash
docker compose up -d     # 起動（バックグラウンド）
docker compose ps        # 状態確認。STATUS が healthy になれば起動完了
docker compose down      # 停止・コンテナ削除（データは残る）
```

### MySQLの接続確認

コンテナ内のmysqlクライアントで、開発ユーザーとして接続できることを確認する。

```bash
docker exec -it pibit-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
```

ホストから接続する場合は `127.0.0.1:3307` を指定する（`mysql` クライアントが必要）。

```bash
mysql -h 127.0.0.1 -P 3307 -u <MYSQL_USER> -p <MYSQL_DATABASE>
```

ポートは `127.0.0.1` にのみ公開しており、同一ネットワークの他のPCからは接続できない。

### データの永続化

データはDocker Volume `mysql_data`（Composeのプロジェクト名が付いた `backend_mysql_data`）に保存される。`docker compose down` やコンテナの再作成ではデータは消えない。

### `down -v` の注意

```bash
docker compose down -v
```

`-v` を付けるとVolumeも削除され、**DBのデータがすべて消える**。作り直したい場合のみ実行する。なお、Shadow Databaseの作成と権限付与（`docker/mysql/init/`）は空のVolumeでの初回起動時にのみ実行される。`.env` のDB名・ユーザー名・パスワードを変更した場合も、反映には `down -v` による再作成が必要。

### Shadow Databaseと権限

`prisma migrate dev` はShadow Databaseを使う。このプロジェクトでは専用の `pibit_shadow`（`MYSQL_SHADOW_DATABASE`）を初期化スクリプトで作成し、開発ユーザーの権限を「アプリ用DB」と「Shadow Database」の2つに限定している。グローバル権限（`CREATE DATABASE` など）は付与していない。Prisma導入後は、`schema.prisma` の `datasource` で `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")` を指定する想定（次の工程で確認する）。

### Prismaから接続する際の `DATABASE_URL` の構造

```text
mysql://<ユーザー名>:<パスワード>@<ホスト>:<ポート>/<データベース名>
mysql://pibit_user:<パスワード>@127.0.0.1:3307/pibit_dev
```

- ホスト側から接続するため、ポートはコンテナ内の `3306` ではなく公開ポートの `3307`
- パスワードに `@` `:` `/` などの記号を含む場合はURLエンコードする
- rootアカウントではなく `MYSQL_USER` で接続する

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

To add it to this project:

```bash
$ npm install @nestjs/observe
```

Then follow the [setup guide](https://docs.nestjs.com/observability/overview) - it takes a single import and an app key.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
