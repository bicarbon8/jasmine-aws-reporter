const JasmineAwsReporter = require('./src/jasmine-aws-reporter');
var reporterConfig;
try {
    reporterConfig = require('./reporter-config.json');
} catch (e) {
    reporterConfig = {};
}

module.exports = new JasmineAwsReporter({
    kinesisfirehose_regionendpoint: reporterConfig.kinesisfirehose_regionendpoint || process.env.kinesisfirehose_regionendpoint,
    kinesisfirehose_deliverystream: reporterConfig.kinesisfirehose_deliverystream || process.env.kinesisfirehose_deliverystream,
    aws_auth_type: reporterConfig.aws_auth_type || process.env.aws_auth_type || 'instance',
    aws_access_key_id: reporterConfig.aws_access_key_id,
    aws_secret_access_key: reporterConfig.aws_secret_access_key,
    aws_session_token: reporterConfig.aws_session_token
});