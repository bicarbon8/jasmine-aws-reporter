const AwsKinesisFirehoseApi = require('../../src/kinesis-firehose/aws-kinesis-firehose-api');
const utils = require('../../src/helpers/utils');

describe('AwsKinesisFirehoseApi', () => {
    it('can handle exceptions from the AWS call', async () => {
        let api = new AwsKinesisFirehoseApi({
            kinesisfirehose_regionendpoint: 'eu-west-1',
            kinesisfirehose_deliverystream: 'qa-reporting',
            aws_auth_type: 'config',
            aws_access_key_id: '',
            aws_secret_access_key: ''
        });
        spyOn(api.client, 'putRecord').and.throwError('fake exception on putRecord');
        let results = [
            {TestId: 'C123', DurationMs: 123, Created: utils.getFormattedDate()}
        ];

        await api.sendResults('fake test name', ...results);
        expect(api.client.putRecord).toHaveBeenCalledTimes(1);
    });
});