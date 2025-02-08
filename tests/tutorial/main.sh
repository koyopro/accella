#!/bin/bash

# Setup
dir=$(pwd)
npm create accella@latest my-app
cd my-app

# Start the server
npm run dev &
sleep 1
pids=$(ps ax | grep 'astro dev' | grep -v grep | awk '{print $1}')

status_code=$(curl -o /dev/null -s -w "%{http_code}" http://localhost:4321/)
if [ "$status_code" -ne 200 ]; then
  echo "Request failed with status code $status_code"
  kill $pids
  exit 1
else
  echo "Request succeeded with status code $status_code"
fi

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
