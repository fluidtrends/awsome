#!/bin/bash
set -e
IFS='|'

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":false,\
\"accessKeyId\":\"AKIAYGQNSHJYHAE4AJWY\",\
\"secretAccessKey\":\"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\",\
\"region\":\"us-east-1\"\
}"
NOTIFICATIONSCONFIG="{\
\"Pinpoint\":{
\"SMS\":{
\"Enabled\":true\
},\
\"Email\":{
\"Enabled\":true,\
\"FromAddress\":\"xxx@amzon.com\",\
\"Identity\":\"identityArn\",\
\"RoleArn\":\"roleArn\"\
},\
\"APNS\":{
\"Enabled\":true,\
\"DefaultAuthenticationMethod\":\"Certificate\",\
\"P12FilePath\":\"p12filePath\",\
\"Password\":\"p12FilePasswordIfAny\"\
},\
\"FCM\":{
\"Enabled\":true,\
\"ApiKey\":\"fcmapikey\"\
}\
}\
}"
AMPLIFY="{\
\"envName\":\"mydevabc\"\
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"
CATEGORIES="{\
}"

./node_modules/@aws-amplify/cli/bin/amplify init \
--amplify $AMPLIFY \
--providers $PROVIDERS \
--categories $CATEGORIES \
--yes

