#!/bin/bash

projectLibs=(
  ${thunderstormLibraries[@]}
  app-shared
)

backendApps=(
  app-backend
)

frontendApps=(
  app-frontend
)

testServiceAccount=../.trash/test-account.json
