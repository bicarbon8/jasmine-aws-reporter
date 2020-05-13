const JasmineAwsReporter = require('../src/jasmine-aws-reporter');

describe('JasmineAwsReporter', () => {
    it('can send passing results to Kinesis Firehose endpoint on spec completion', async () => {
        let reporter = new JasmineAwsReporter({
            kinesisfirehose_regionendpoint: 'eu-west-1',
            kinesisfirehose_deliverystream: 'qa-reporting',
            aws_auth_type: 'config',
            aws_access_key_id: '',
            aws_secret_access_key: ''
        });
        spyOn(reporter, 'createResultFromTest').and.callThrough();
        spyOn(reporter, 'sendResults').and.callFake((testFullName, resultRecords) => {
            /* TODO: verify records */
        });

        let specResult = {
            description: 'C123 C234 Fake Test',
            status: 'passed',
            duration: 1234,
            fullName: 'Fake Suite C123 C234 Fake Test',
            failedExpectations: []
        };

        await reporter.specDone(specResult);
        expect(reporter.sendResults).toHaveBeenCalledTimes(1);
        expect(reporter.createResultFromTest).toHaveBeenCalledTimes(2);
    });
});