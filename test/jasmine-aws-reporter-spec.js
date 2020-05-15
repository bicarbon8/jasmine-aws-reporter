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
        let actualResultRecords = [];
        let actualTestFullName = null;
        spyOn(reporter, 'sendResults').and.callFake((testFullName, ...resultRecords) => {
            actualTestFullName = testFullName;
            actualResultRecords = resultRecords;
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
        expect(actualTestFullName).toBe(`${specResult.fullName}`);
        expect(actualResultRecords.length).toBe(2);
        expect(actualResultRecords[0].TestId).toBe('C123');
        expect(actualResultRecords[0].TestStatus).toBe(0);
        expect(actualResultRecords[0].TestStatusStr).toBe('passed');
        expect(actualResultRecords[1].TestId).toBe('C234');
        expect(actualResultRecords[1].TestStatus).toBe(0);
        expect(actualResultRecords[1].TestStatusStr).toBe('passed');
    });

    it('can send failing results to Kinesis Firehose endpoint on spec completion', async () => {
        let reporter = new JasmineAwsReporter({
            kinesisfirehose_regionendpoint: 'eu-west-1',
            kinesisfirehose_deliverystream: 'qa-reporting',
            aws_auth_type: 'config',
            aws_access_key_id: '',
            aws_secret_access_key: ''
        });
        spyOn(reporter, 'createResultFromTest').and.callThrough();
        let actualResultRecords = [];
        let actualTestFullName = null;
        spyOn(reporter, 'sendResults').and.callFake((testFullName, ...resultRecords) => {
            actualTestFullName = testFullName;
            actualResultRecords = resultRecords;
        });

        let specResult = {
            description: 'C123 C234 Fake Test',
            status: 'failed',
            duration: 1234,
            fullName: 'Fake Suite C123 C234 Fake Test',
            failedExpectations: [
                {message: 'Fake failure message 1', stack: 'Fake failure stack 1'},
                {message: 'Fake failure message 2', stack: 'Fake failure stack 2'}
            ]
        };

        await reporter.specDone(specResult);
        expect(reporter.sendResults).toHaveBeenCalledTimes(1);
        expect(reporter.createResultFromTest).toHaveBeenCalledTimes(2);
        expect(actualTestFullName).toBe(`${specResult.fullName}`);
        expect(actualResultRecords.length).toBe(2);
        expect(actualResultRecords[0].TestId).toBe('C123');
        expect(actualResultRecords[0].TestStatus).toBe(4);
        expect(actualResultRecords[0].TestStatusStr).toBe('failed');
        let expectedErrorString = '';
        for (var i=0; i<specResult.failedExpectations.length; i++) {
            expectedErrorString += specResult.failedExpectations[i].message + '\n'
                + specResult.failedExpectations[i].stack + '\n';
        }
        expect(actualResultRecords[0].ErrorMessage).toBe(expectedErrorString);
        expect(actualResultRecords[1].TestId).toBe('C234');
        expect(actualResultRecords[1].TestStatus).toBe(4);
        expect(actualResultRecords[1].TestStatusStr).toBe('failed');
        expect(actualResultRecords[1].ErrorMessage).toBe(expectedErrorString);
    });

    it('calls the api client and awaits a response', async () => {
        let options = {
            kinesisfirehose_regionendpoint: 'eu-west-1',
            kinesisfirehose_deliverystream: 'qa-reporting',
            aws_auth_type: 'config',
            aws_access_key_id: '',
            aws_secret_access_key: ''
        };
        let reporter = new JasmineAwsReporter(options);
        spyOn(reporter.kinesisApi.client, 'putRecord').and.callFake((params, callback) => {
            callback();
        });

        let specResult = {
            description: 'C123 C234 Fake Test',
            status: 'passed',
            duration: 1234,
            fullName: 'Fake Suite C123 C234 Fake Test',
            failedExpectations: []
        };

        await reporter.specDone(specResult);
        expect(reporter.kinesisApi.client.putRecord).toHaveBeenCalledTimes(2);
        // TODO: check client configuration
    });
});