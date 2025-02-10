#!/bin/bash

# Setup
dir=$(pwd)
npm create accella@latest my-app
cd my-app

check_status_code() {
  local url=$1
  local expected_status=$2
  status_code=$(curl -o /dev/null -s -w "%{http_code}" $url)
  if [ "$status_code" -ne $expected_status ]; then
    echo "Request to $url failed with status code $status_code"
    kill $pids
    exit 1
  else
    echo "Request to $url succeeded with status code $status_code"
  fi
}

# Start the server
npm run dev &
sleep 1
pids=$(ps ax | grep 'astro dev' | grep -v grep | awk '{print $1}')

check_status_code "http://localhost:4321/" 200

cat ${dir}/tests/tutorial/about.astro >> src/pages/about.astro
sleep 1
check_status_code "http://localhost:4321/about" 200

check_exit_status() {
  if [ $1 -ne 0 ]; then
    echo "$2 failed"
    kill $pids
    exit 1
  else
    echo "$2 succeeded"
  fi
}

unset DATABASE_URL
npx prisma migrate deploy
check_exit_status $? "Prisma migrate deploy"

cat ${dir}/tests/tutorial/user.prisma >> db/schema/main.prisma
npx prisma migrate dev --name "create-user"
check_exit_status $? "Prisma migrate dev"

npx vitest run
check_exit_status $? "Run test"

echo "All tests passed"
kill $pids
