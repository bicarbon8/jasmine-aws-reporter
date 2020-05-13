const utils = require('./helpers/utils');
const AwsKinesisApi = require('./kinesis-firehose/aws-kinesis-firehose-api');
const pjson = require('../package.json');

class JasmineAwsReporter {
    constructor(options) {
        this.options = options;
        this.kinesisApi = new AwsKinesisApi(this.options);
    }
  
    async specDone(result) {
        var caseIds = utils.titleToCaseIds(result.description);
        var results = [];
        var err = null;
        for(var i = 0; i < result.failedExpectations.length; i++) {
            if (!err) {
                err = '';
            }
            err += result.failedExpectations[i].message + '\n';
                + result.failedExpectations[i].stack;
        }
        for (var i=0; i<caseIds.length; i++) {
            var id = caseIds[i];
            var r = this.createResultFromTest(result, id, err);
            results.push(r);
        }
        await this.sendResults(result.fullName, results);
    }

    createResultFromTest(test, id, err) {
        var status = utils.getTestStatus(test);
        var statusStr = utils.getStatusString(status);
        var created = utils.getFormattedDate();
        var testResult = {
            Created: created,
            TestId: id,
            TestStatus: status,
            DurationMs: test.duration,
            TestStatusStr: statusStr,
            TestName: test.description,
            TestFullName: test.fullName,
            Source: pjson.name,
            Version: pjson.version
        };
        if (err) {
            testResult['ErrorMessage'] = err;
        }
        return testResult;
    }

    async sendResults(testFullName, resultRecords) {
        this.kinesisApi.sendResults(testFullName, resultRecords);
    }
  }

  module.exports = JasmineAwsReporter;