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
export CFN_IMAGE_TAG="$1"
export CFN_LAMBDA_BUILD_TAG="$1"

# SQS
cfn_manage deploy-stack \
  --stack-name "rangingtool-kr-range-service-sns-sqs" \
  --template-file 'deploy/cloudformation/kr-range-service-sns-sqs.yml' \
  --parameters-file "deploy/cloudformation/params/${CFN_ENVIRONMENT}.yml" \
  --role-name "$NONPRIV_ROLE_NAME"

# S3
cfn_manage deploy-stack \
  --stack-name "rangingtool-kr-range-export-bucket-stack" \
  --template-file 'deploy/cloudformation/kr-range-s3-buckets.yml' \
  --parameters-file "deploy/cloudformation/params/${CFN_ENVIRONMENT}.yml" \
  --role-name "$NONPRIV_ROLE_NAME"

# Lambda
cfn_manage deploy-stack \
  --stack-name "rangingtool-kr-range-lambda-stack" \
  --template-file 'deploy/cloudformation/kr-range-lambda.yml' \
  --parameters-file "deploy/cloudformation/params/${CFN_ENVIRONMENT}.yml" \
  --role-name "$NONPRIV_ROLE_NAME"

# ECS
cfn_manage deploy-stack \
  --stack-name "rangingtool-kr-range-service" \
  --template-file 'deploy/cloudformation/kr-range-service.yml' \
  --parameters-file "deploy/cloudformation/params/${CFN_ENVIRONMENT}.yml" \
  --role-name "$NONPRIV_ROLE_NAME"
