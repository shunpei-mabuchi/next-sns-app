#!/bin/bash
# 初回起動（空のボリューム）時のみ実行される。
# Prisma migrate dev 用のShadow Databaseを作成し、開発用ユーザーの権限を
# アプリ用DBとShadow Databaseの2つに限定する。グローバル権限は付与しない。
# 公式イメージのエントリポイントからsourceされるため、set -u は使わない（内部関数が失敗する）。
set -eo pipefail

docker_process_sql <<EOSQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_SHADOW_DATABASE}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
GRANT ALL PRIVILEGES ON \`${MYSQL_SHADOW_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
EOSQL
