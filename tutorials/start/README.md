# Get Started With AWSome

Glad you're interested in checking AWSome out. To start making the most of AWSome you will need to have your AWS credentials ready so if you don't have those setup, let's do that before moving on.

If you do have your credentials, that's great. Feel free to just [skip ahead then](#installation).

Otherwise, please read on to setup your AWS account.

* [AWS Account Setup](#aws-account-setup)
  * [STEP 1: Get an AWS Account](#step-1-get-an-aws-account)
  * [STEP 2: Login to your AWS Console](#step-2-login-to-your-aws-console)
  * [STEP 3: Create a new AWS user](#step-3-create-a-new-aws-user)
  * [STEP 4: Create a group policy](#step-4-create-a-group-policy)
* [Installation](#installation)

## AWS Account Setup

Let's get your AWS account up and running. If you don't have an AWS account, not to worry, this guide will help you set one up, just continue reading.

#### STEP 1: Get an AWS Account
(*you may skip this step if you already have an AWS account*)

* So you don't have an AWS Account yet. Not to worry, it takes 5 minutes or less to get one.
* Just go ahead and [create your free AWS account now](https://portal.aws.amazon.com/billing/signup?nc2=h_ct&redirect_url=https%3A%2F%2Faws.amazon.com%2Fregistration-confirmation#/start) and let's continue once you've completed the sign up process.

[![](images/step-1.png)]()

#### STEP 2: Login to your AWS Console

* AWS has a nice online console that you can access whenever you want to manage your AWS resources.
* So let's go now and [login to your AWS console](https://console.aws.amazon.com/) so we can create a new user.
* Just login with your **email** and **password** that you used to create your account.

[![](images/step-2.png)]()

#### STEP 3: Create a new AWS user

* We don't always want to access your AWS account with your email and password, because that's not secure, so instead, AWS allows you to create special users that are more secure to use.
* We want to create such a user now, so let's go ahead and [start the New User Wizard](https://console.aws.amazon.com/iam/home?region=us-east-1#/users$new?step=details) and complete it step by step.

[![](images/step-3-start.png)]()

* **1. First**, give your user a name (call your user **awsome**).

[![](images/step-3-1.png)]()

* **2. Next**, check both check boxes to specify that you want *Programmatic access* and *AWS Management Console access* as well. And let the *Autogenerated password* and the *Require password reset* boxes selected.

[![](images/step-3-2.png)]()

* **3. Next**, click the **Next: Permissions** button to go and set some permissions for the new user.

[![](images/step-3-3.png)]()

* **4. Next**, click the **Create group** button to create a brand new group for your user.

[![](images/step-3-4.png)]()

* **5. Next**, type **awsome** as the name of the group (yeah let's keep it identical to the user name we created in Step 1)

[![](images/step-3-5.png)]()

* **6. Next**, click the **Create group** button to finish the process, and don't worry about the policy stuff, just ignore that.

[![](images/step-3-6.png)]()

**7. Almost there.** Good job, you just created a brand new user with its own group. We will use this user to access your AWS account programmatically.

[![](images/step-3-7.png)]()

**8. Next**, click the **Next: Review** button to review our new user.

[![](images/step-3-8.png)]()

**9. Looks good!** Let's just go ahead and confirm that we want to finish the process now. Just click the **Create user** button to finish.

[![](images/step-3-9.png)]()

---
**Amazing!** You've got yourself a brand new user. Congrats! You will notice the *Access key ID* and the *Secret access key* that come with your user. Those are very important and we need those to access your account. The *Secret access key* is especially sensitive that's why AWS hides that.

**10. Next**, click the *Show* link next to the *Secret access key* and do the same for the *Password* and copy the values and **STORE THEM SOMEWHERE SAFE.**

*Use a Password Manager like [1Password](https://1password.com/) or do whatever you do with all your sensitive information like passwords or credit card numbers. But whatever you do, make sure these are safe and treat them as you would any sensitive information - with utmost care for their security.*

[![](images/step-3-10.png)]()

----

But first, we have a bit more work to do. Don't worry, this will be quick.

#### STEP 4: Create a group policy

Policies are used in AWS to give users specific permissions to AWS resources. You can give a user permission to everything but in general that's a security concern.

So what we want to do is to give our **awsome** user we created, the permissions it needs and not a permission more.

* We want to [start out by going to the awsome group](https://console.aws.amazon.com/iam/home?region=us-east-1#/groups/awsome) actually, and not the user, so that we can control the permissions at the group level.
* **First**, click on the *Inline Policies* section to expand it and the lick the *click here* link to create a policy.

[![](images/step-4-start.png)]()

* **Next**, select the *Custom Policy* section and press the *Select* button.

[![](images/step-4-1.png)]()

* **Next**, give your policy a name, **awsome** would work and enter the following text for the policy:

```
{
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "awsomepolicy1",
              "Action": [
                  "s3:headBucket",
                  "s3:createBucket",
                  "s3:listObjectsV2",
                  "s3:deleteBucket",
                  "s3:getBucketWebsite",
                  "s3:putBucketWebsite",
                  "s3:putBucketPolicy",
                  "s3:deleteBucketWebsite",
                  "s3:putObject",
                  "s3:deleteObject",
                  "route53:listHostedZones",
                  "route53:createHostedZone",
                  "route53:deleteHostedZone",
                  "route53:listResourceRecordSets",
                  "route53:changeResourceRecordSets"
              ],
              "Effect": "Allow",
              "Resource": "*"
          }
      ]
  }
```

[![](images/step-4-2.png)]()

* **Next**, click the **Apply Policy** button to apply our new policy to the group.

[![](images/step-4-3.png)]()

**You did it!** You have not only created a new user with its own group but you've attached a policy to your group.

This is great. Your AWS account is now ready to go.

[![](images/step-4-done.png)]()

## Installation

Great, you should have your AWS user credentials now (key and secret) so you can just install AWSome and start using it.

To install, just add ```awsome``` to your NPM module like so:

```
npm i -S awsome
```

Then you can import ```awsome``` in your code as follows:

```
const awsome = require('awsome')
```

That's all there is to it. You're not ready to start using AWSome.

Please have a look at the [examples](https://github.com/fluidtrends/awsome/tree/master/examples) to see what you can do with AWSome.

Have fun!