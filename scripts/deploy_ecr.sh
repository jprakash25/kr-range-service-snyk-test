#!/bin/bash

# http://blog.kablamo.org/2015/11/08/bash-tricks-eux/
set -euxo pipefail
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
. scripts/project_setting.sh

NONPRIV_ROLE_NAME='infra-cfnrole-rangingtool-nonprivileged'

# to force AMILookup when running the ecs template
CFN_RAND_STRING="$(date '+%s' | base64)"
export CFN_RAND_STRING

cfn_manage deploy-stack \
  --stack-name "rangingtool-kmart-kr-range-service-ecr" \
  --template-file 'deploy/cloudformation/kr-range-service-ecr.yml' \
  --parameters-file "deploy/cloudformation/params/${CFN_ENVIRONMENT}.yml" \
  --role-name "$NONPRIV_ROLE_NAME"
