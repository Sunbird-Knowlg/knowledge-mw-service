var emailService = require('../../service/emailService.js')
var expect = require('chai').expect
require('chai').use(require('chai-as-promised'))
var sinon = require('sinon')
var contentProvider = require('sb_content_provider_util')
var emailServiceTestData = require('../fixtures/services/emailServiceTestData').emailServiceTestData

var mockedGetContent, mockedUserSearch,
  req = emailServiceTestData.REQUEST,
  mockedSendEmail,
  mockedGetForm,
  mockFunction = function () {
  }

describe('Email service.createFlagContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
  })

  it('should return error as content ID is not present', function (done) {
    var request = JSON.parse(JSON.stringify(emailServiceTestData.REQUEST))
    request.params.contentId = null
    emailService.createFlagContentEmail(request, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Required content id is missing')
      done()
    })
  })

  it('should return error as content ID is not matched', function (done) {
    mockedGetContent.yields('error', null)
    emailService.createFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should return error as success code is not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    emailService.createFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should not send email errored from service', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields('error', null)
    emailService.createFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as status code not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields(null, emailServiceTestData.ErrorResponse)
    emailService.createFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should send email when flag content api called', function (done) {
    var contentResponse = JSON.parse(JSON.stringify(emailServiceTestData.SuccessResponse))
    contentResponse.result.content = {flagReasons: 'sss'}
    mockedGetContent.yields(null, contentResponse)
    mockedSendEmail.yields(null, emailServiceTestData.SuccessResponse)
    emailService.createFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(err).to.equal(null)
      expect(res).to.equal(true)
      done()
    })
  })
})

describe('Email service.acceptFlagContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
  })

  it('should return error as content ID is not present', function (done) {
    var request = JSON.parse(JSON.stringify(emailServiceTestData.REQUEST))
    request.params.contentId = null
    emailService.acceptFlagContentEmail(request, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Content id is missing')
      done()
    })
  })

  it('should return error as content ID is not matched', function (done) {
    mockedGetContent.yields('error', null)
    emailService.acceptFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should return error as success code is not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    emailService.acceptFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should not send email errored from service', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields('error', null)
    emailService.acceptFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as status code not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields(null, emailServiceTestData.ErrorResponse)
    emailService.acceptFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should send email when flag content api called', function (done) {
    var response = JSON.parse(JSON.stringify(emailServiceTestData.SuccessResponse))
    response.result.content = {
      flagReasons: 'sss'
    }
    mockedGetContent.yields(null, response)
    mockedSendEmail.yields(null, emailServiceTestData.SuccessResponse)
    emailService.acceptFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(err).to.equal(null)
      expect(res).to.equal(true)
      done()
    })
  })
})

describe('Email service.rejectFlagContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
  })

  it('should return error as content ID is not present', function (done) {
    var request = JSON.parse(JSON.stringify(emailServiceTestData.REQUEST))
    request.params.contentId = null
    emailService.rejectFlagContentEmail(request, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Content id is missing')
      done()
    })
  })

  it('should return error as content ID is not matched', function (done) {
    mockedGetContent.yields('error', null)
    emailService.rejectFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should return error as success code is not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    emailService.rejectFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should not send email errored from service', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields('error', null)
    emailService.rejectFlagContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as status code not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedSendEmail.yields(null, emailServiceTestData.ErrorResponse)
    emailService.rejectFlagContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should send email when flag content api called', function (done) {
    var contentResponse = JSON.parse(JSON.stringify(emailServiceTestData.SuccessResponse))
    contentResponse.result.content = {flagReasons: 'sss'}
    mockedGetContent.yields(null, contentResponse)
    mockedSendEmail.yields(null, emailServiceTestData.SuccessResponse)
    emailService.rejectFlagContentEmail(req, function (err, res) {
      expect(err).to.equal(null)
      expect(res).to.equal(true)
      done()
    })
  })
})

describe('Email service.unlistedPublishContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
  })

  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
  })

  it('should return error as content ID is not present', function (done) {
    var request = JSON.parse(JSON.stringify(emailServiceTestData.REQUEST))
    request.params.contentId = null
    request.body.request = {
      content: {
        baseUrl: 'test Base URL'
      }
    }
    emailService.unlistedPublishContentEmail(request, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Content id missing')
      done()
    })
  })

  it('should return error as content ID is not matched', function (done) {
    req.body.request = {
      content: {
        baseUrl: null
      }
    }
    req.params.contentId = 'mock Content ID'
    mockedGetContent.yields('error', null)
    emailService.unlistedPublishContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should return error as success code is not matched', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    emailService.unlistedPublishContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Invalid content id')
      done()
    })
  })

  it('should not send email errored from service', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {}
      }
    }
    mockedGetContent.yields(null, response)
    mockedSendEmail.yields('error', null)
    emailService.unlistedPublishContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as status code not matched', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {}
      }
    }
    var emailResponse = {
      responseCode: 'RESOURCE_NOT_FOUND'
    }
    mockedGetContent.yields(null, response)
    mockedSendEmail.yields(null, emailResponse)
    emailService.unlistedPublishContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should send email when flag content api called', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {flagReasons: 'sss'}
      }
    }
    var emailResponse = {
      responseCode: 'OK'
    }
    mockedGetContent.yields(null, response)
    mockedSendEmail.yields(null, emailResponse)
    emailService.unlistedPublishContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(err).to.equal(null)
      expect(res).to.equal(true)
      done()
    })
  })
})

describe('Email service.publishedContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
    mockedGetForm = sinon.stub(contentProvider, 'getForm').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
    mockedGetForm.restore()
  })

  it('should return error as content ID is not present', function (done) {
    req.params.contentId = null
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Content id is missing')
      done()
    })
  })

  it('should return error as content ID is not matched', function (done) {
    req.params.contentId = 'mock Content ID'
    mockedGetContent.yields('error', null)
    mockedGetForm.yields(null, {})
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should return error as success code is not matched fro fetching content', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    mockedGetForm.yields(null, {})
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email errored from content get service', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetForm.yields(null, {})
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email errored from get form service', function (done) {
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetForm.yields(null, emailServiceTestData.ErrorResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as all data not found for sending mail', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {}
      }
    }
    var formResponse = {
      responseCode: 'OK'
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as error in email service', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID'
        }
      }
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields('error', null)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should not send email as status code not matched in email service', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID'
        }
      }
    }
    var mailErrorResponse = {
      responseCode: 'RESOURCE_NOT_FOUND'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailErrorResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should send email for mimetype application/vnd.ekstep.content-collection', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.content-collection',
          contentType: 'Course'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })

  it('should send email for mimetype application/vnd.ekstep.ecml-archive', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.ecml-archive',
          contentType: 'Course'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })

  it('should send email for if not course', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.content-collection'
        }
      }
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, emailServiceTestData.SuccessResponse)
    emailService.publishedContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })
})

describe('Email service.rejectContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
    mockedGetForm = sinon.stub(contentProvider, 'getForm').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
    mockedGetForm.restore()
  })

  it('should send email for mimetype application/vnd.ekstep.content-collection', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.content-collection'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.rejectContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })

  it('should send email if mimetype is application/vnd.ekstep.ecml-archive', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.ecml-archive'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.rejectContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })

  it('should send email if mimetype is application/vnd.ekstep.ecml-archive', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID',
          mimeType: 'application/vnd.ekstep.ecml-archive'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.rejectContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })

  it('should send email', function (done) {
    var response = {
      responseCode: 'OK',
      result: {
        content: {
          id: 'mockID'
        }
      }
    }
    var mailResponse = {
      responseCode: 'OK'
    }
    var formResponse = {
      responseCode: 'OK',
      result: {
        form: {
          data: {
            fields: [emailServiceTestData.PUBLISHED_CONTENT]
          }
        }
      }
    }
    mockedGetContent.yields(null, response)
    mockedGetForm.yields(null, formResponse)
    mockedSendEmail.yields(null, mailResponse)
    emailService.rejectContentEmail(req, function (err, res) {
      expect(res).to.equal(true)
      expect(err).to.equal(null)
      done()
    })
  })
})

describe('Email service.reviewContentEmail', function () {
  before(function () {
    mockedGetContent = sinon.stub(contentProvider, 'getContent').returns(mockFunction)
    mockedSendEmail = sinon.stub(contentProvider, 'sendEmail').returns(mockFunction)
    mockedGetForm = sinon.stub(contentProvider, 'getForm').returns(mockFunction)
    mockedUserSearch = sinon.stub(contentProvider, 'userSearch').returns(mockFunction)
  })
  after(function () {
    mockedGetContent.restore()
    mockedSendEmail.restore()
    mockedGetForm.restore()
  })

  it('should return error as content ID is not present', function (done) {
    var request = JSON.parse(JSON.stringify(emailServiceTestData.REQUEST))
    request.params.contentId = null
    emailService.reviewContentEmail(request, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Content id is missing')
      done()
    })
  })

  it('should thorw error as user information not fetched', function (done) {
    mockedUserSearch.yields('error', null)
    emailService.reviewContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should throw error as response code not matched for fetching user information', function (done) {
    mockedUserSearch.yields(null, emailServiceTestData.ErrorResponse)
    emailService.reviewContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should throw error as content ID is not matched for fetching content', function (done) {
    mockedUserSearch.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetContent.yields('error', null)
    emailService.reviewContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should throw error as success code is not matched for fetching content', function (done) {
    mockedUserSearch.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetContent.yields(null, emailServiceTestData.ErrorResponse)
    emailService.reviewContentEmail(emailServiceTestData.REQUEST, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should return error as for not fetched', function (done) {
    mockedUserSearch.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetForm.yields(null, {})
    emailService.reviewContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })

  it('should return error as success code is not matched for fetching template', function (done) {
    mockedUserSearch.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetContent.yields(null, emailServiceTestData.SuccessResponse)
    mockedGetForm.yields(null, {})
    emailService.reviewContentEmail(req, function (err, res) {
      expect(res).to.equal(null)
      expect(err.message).to.equal('Sending email failed')
      done()
    })
  })
})
