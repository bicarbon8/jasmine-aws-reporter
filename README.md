# jasmine-aws-reporter
a test reporter plugin for Jasmine that is capable of submitting test results to AWS systems such as Kinesis Firehose and Elasticsearch

## Configuration
The *jasmine-aws-reporter* relies on a configuration file or environment variables to specify configuration parameters. If relying on a configuration file, the file must be named `reporter-config.json` and be located at the project root directory or the root directory from where you execute your tests.

### Example Configuration File
```json
{
    "kinesisfirehose_regionendpoint": "eu-west-1",
    "kinesisfirehose_deliverystream": "test-reporting",
    "aws_auth_type": "config",
    "aws_access_key_id": "your_IAM_access_key_id",
    "aws_secret_access_key": "your_IAM_secret_access_key",
    "aws_session_token": "your_IAM_session_token"
}
```
> :warning: if using environment variables, do **NOT** set configuration values as these would override the values
- `kinesisfirehose_regionendpoint`: *string* - the AWS region where your Kinesis Firehose endpoint is deployed. values like `eu-west-1` or `us-west-2` are expected
- `kinesisfirehose_deliverystream`: *string* - the name of the index / delivery stream for your Kinesis Firehose endpoint.
- `aws_auth_type`: *string* - a value of `config`, `instance` or `environment` to indicate where the AWS IAM credentials should be read from. defaults to `instance` if not specified elsewhere
- `aws_access_key_id`: *string* - required only if using an `aws_auth_type` of `config`, this is your IAM credential access key id
- `aws_secret_access_key`: *string* - required only if using an `aws_auth_type` of `config`, this is your IAM credential secret key
- `aws_session_token`: *string* - reqired only if using an `aws_auth_type` of `config` and a temporary IAM credential, this is your IAM credential session token

## Test Naming
Your Jasmine tests results can optionally include a Test ID that uses TestRail's Case ID formatting. To include this, add the Case IDs to your test titles as follows:
```javascript
// Good:
it('C123 C234 Can authenticate as a valid user', () => {...});
it('Can authenticate C123 as a valid user C234', () => {...});

// Bad:
it('C123Can authenticate as a valid user', () => {...});
it('Can authenticate as a valid user (C123)', () => {...});
it('Can authenticate as a valid userC123', () => {...});
it('Can authenticate C123C234 as a valid user', () => {...});
```

## Test Result Records
the test results are transmitted to AWS using the following format:
```json
{
    "Created": "YYYY-MM-DD:HH:mm:ss.mmmZ",
    "TestId": "C123", // or null if none exists
    "TestStatus": 0, // 0=passed, 4=failed, 5=skipped
    "DurationMs": 12334, // milliseconds
    "TestStatusStr": "passed", // or "failed" or "skipped"
    "TestName": "C123 C234 Can authenticate as a valid user",
    "TestFullName": "Authentication Standard User C123 C234 Can authenticate as a valid user",
    "Source": "jasmine-aws-reporter",
    "Version": "1.0.0",
    "ErrorMessage": "in the case of failure, the error and stack would be here; otherwise undefined"
}
```