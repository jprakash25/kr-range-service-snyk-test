#!/bin/bash
# shellcheck disable=SC1091
TEAM_NAME="rangingtool"

echo "${TEAM_NAME}"
sed -i "s/source_team/${TEAM_NAME}/g" ./project.yml
sed -i "s/source_owner/${TEAM_NAME}/g" ./project.yml
sed -i "s/source_billing/${TEAM_NAME}/g" ./project.yml

cat ./project.yml