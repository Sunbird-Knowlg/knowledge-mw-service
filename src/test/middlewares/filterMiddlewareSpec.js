<<<<<<< 198581f70fcc553bdf8a8b3c40f5d0ebd95198e9
/**
 * @name : requestMiddleware.js
 * @description : Responsible for test request.middleware.js
 * @author      : Revathi
 **/
var filterMiddleware = require('../../middlewares/filter.middleware')
var filterService = require('../../service/filterService')
var configUtil = require('../../libs/sb-config-util')
// var _ = require('underscore')

const req = {
  'body': {
    'request': {
      'filters': {
        channel: [ 'in.ekstep' ],
        framework: [ 'NCF' ],
        contentType: [ 'Resource' ],
        mimeType: [ 'application/vnd.ekstep.content-collection' ],
        resourceType: [ 'Learn' ]
      }
    }
  }
}

const req1 = {
  'body': {
    'request': {
      'filters': {
      }
    }
  }
}

describe('Initialization of meta filters', function () {
  it('check for the request with  filters property, else then do next', function () {
    filterMiddleware.addMetaFilters(req, {}, function () {
      expect(req.body.request.filters.channel && req.body.request.filters.framework &&
        req.body.request.filters.contentType &&
      req.body.request.filters.mimeType && req.body.request.filters.resourceType).toBeDefined()
    })
  })
  it('check for no filter property in request, then call getMetadataFilterQuery() to get config', function () {
    filterMiddleware.addMetaFilters(req, {}, function () {
      expect(req.body.request.filters.channel).toMatch('in.ekstep')
      expect(req.body.request.filters.contentType).toMatch('Resource')
      expect(req.body.request.filters.framework).toMatch('NCF')
      expect(req.body.request.filters.mimeType).toMatch('application/vnd.ekstep.content-collection')
      expect(req.body.request.filters.resourceType).toMatch('Learn')
    })
  })

  it('check for no request and get config', function () {
    spyOn(filterService, 'getMetadataFilterQuery')
    filterMiddleware.addMetaFilters(req1, {}, function () {})
    expect(filterService.getMetadataFilterQuery).toHaveBeenCalled()
  })
  it('check for getChannelSearchString method creates proper blacklisted search string', function () {
    const req1 = {
      'body': {
        'request': {
          'filters': {
          }
        }
      }
    }
    var blacklist = {
      channel: { ne: ['0124758418460180480', '0124758449502453761'] },
      framework: { ne: [ '01231711180382208027', '012315809814749184151' ] },
      contentType: { ne: [ 'Story' ] },
      mimeType: { ne: [ 'application/vnd.ekstep.h5p-archive' ] },
      resourceType: { ne: [ 'Read' ] }
    }

    configUtil.setConfig('META_FILTER_REQUEST_JSON', blacklist)
    filterMiddleware.addMetaFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toEqual(blacklist.channel)
    })
  })
  it('check for getChannelSearchString method creates proper whitelisted search string', function () {
    const req1 = {
      'body': {
        'request': {
          'filters': {
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toEqual(whiteList.channel)
      expect(req1.body.request.filters.framework).toEqual(whiteList.framework)
      expect(req1.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req1.body.request.filters.mimeType).toEqual(whiteList.mimeType)
      expect(req1.body.request.filters.resourceType).toEqual(whiteList.resourceType)
    })
  })

  it('if the filter object (channel) exists in req,  then do not append res channel property to filter', function () {
    const req = {
      'body': {
        'request': {
          'filters': {
            channel: [ 'in.ekstep' ],
            framework: [ 'NCF' ],
            contentType: [ 'Resource' ],
            mimeType: [ 'application/vnd.ekstep.content-collection' ],
            resourceType: [ 'Learn' ]
          }
        }
      }
    }
    filterMiddleware.addMetaFilters(req, {}, function () {
      if (req && req.body && req.body.request && req.body.request.filters.channel) {
        expect(req.body.request.filters.channel).toBeDefined()
      }
    })
  })
  it('if the filter object (framework) exists in req, then do not append res framework to filter', function () {
    if (req && req.body && req.body.request && req.body.request.filters.framework) {
      expect(req.body.request.filters.framework).toBeDefined()
    }
  })

  it('if the filter object (mimeType) exists in req, then do not append res mimeType to filter', function () {
    if (req && req.body && req.body.request && req.body.request.filters.mimeType) {
      expect(req.body.request.filters.mimeType).toBeDefined()
    }
  })

  it('if the filter object (contentType) exists in req, then do not append res contentType to filter', function () {
    if (req && req.body && req.body.request && req.body.request.filters.contentType) {
      expect(req.body.request.filters.contentType).toBeDefined()
    }
  })

  it('if the filter object (resourceType) exists in req, then do not append res resourceType to filter', function () {
    if (req && req.body && req.body.request && req.body.request.filters.resourceType) {
      expect(req.body.request.filters.resourceType).toBeDefined()
    }
  })
})

// negative Scenarios
describe(' Combination of 2 meta filters  defined ', function () {
  it('if only channel, framework is configured, form filter from Env Config service', function () {
    const req1 = {
      'body': {
        'request': {
          'filters': {
            channel: [ 'in.ekstep' ],
            framework: [ 'NCFCOPY' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toBeDefined()
      expect(req1.body.request.filters.framework).toBeDefined()
      expect(req1.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req1.body.request.filters.mimeType).toEqual(whiteList.mimeType)
      expect(req1.body.request.filters.resourceType).toEqual(whiteList.resourceType)
    })
  })
  it('if only framework and mimeType is configured, form filter from Env Config service', function () {
    const req2 = {
      'body': {
        'request': {
          'filters': {
            framework: [ 'NCFCOPY' ],
            mimeType: [ 'application/vnd.ekstep.h5p-archive' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req2, {}, function () {
      expect(req2.body.request.filters.mimeType).toBeDefined()
      expect(req2.body.request.filters.framework).toBeDefined()
      expect(req2.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req2.body.request.filters.channel).toEqual(whiteList.channel)
      expect(req2.body.request.filters.resourceType).toEqual(whiteList.resourceType)
    })
  })
  it('if only framework and resourceType is configured', function () {
    const req3 = {
      'body': {
        'request': {
          'filters': {
            framework: [ 'NCFCOPY' ],
            resourceType: [ 'Learn' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req3, {}, function () {
      expect(req3.body.request.filters.resourceType).toBeDefined()
      expect(req3.body.request.filters.framework).toBeDefined()
      expect(req3.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req3.body.request.filters.channel).toEqual(whiteList.channel)
      expect(req3.body.request.filters.resourceType).toEqual(whiteList.resourceType)
    })
  })

  // this.result.extra_suite_data = {suiteInfo: 'extra info'}
  it('if channel and resourceType is configured', function () {
    var req4 = {
      'body': {
        'request': {
          'filters': {
            channel: [ 'in.ekstep' ],
            resourceType: [ 'Story' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req4, {}, function () {
      expect(req4.body.request.filters.resourceType).toBeDefined()
      expect(req4.body.request.filters.channel).toBeDefined()
      expect(req4.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req4.body.request.filters.framework).toEqual(whiteList.framework)
      expect(req4.body.request.filters.mimeType).toEqual(whiteList.mimeType)
    })
  })

  it('if contentType and mimeType is configured', function () {
    const req5 = {
      'body': {
        'request': {
          'filters': {
            contentType: [ 'in.ekstep' ],
            mimeType: [ 'application/vnd.ekstep.h5p-archive' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req5, {}, function () {
      expect(req5.body.request.filters.contentType).toBeDefined()
      expect(req5.body.request.filters.mimeType).toBeDefined()
      expect(req5.body.request.filters.channel).toEqual(whiteList.channel)
      expect(req5.body.request.filters.framework).toEqual(whiteList.framework)
      expect(req5.body.request.filters.resourceType).toEqual(whiteList.resourceType)
    })
  })
  it('if contentType and resourceType is configured', function () {
    const req6 = {
      'body': {
        'request': {
          'filters': {
            contentType: [ 'Lesson' ],
            resourceType: [ 'Story' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req6, {}, function () {
      expect(req6.body.request.filters.contentType).toBeDefined()
      expect(req6.body.request.filters.resourceType).toBeDefined()
      expect(req6.body.request.filters.channel).toEqual(whiteList.channel)
      expect(req6.body.request.filters.framework).toEqual(whiteList.framework)
      expect(req6.body.request.filters.mimeType).toEqual(whiteList.mimeType)
    })
  })
  it('if channel and mimeType is configured', function () {
    const req7 = {
      'body': {
        'request': {
          'filters': {
            channel: [ 'in.ekstep' ],
            mimeType: [ 'application/vnd.ekstep.h5p-archive' ]
          }
        }
      }
    }
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)

    filterMiddleware.addMetaFilters(req7, {}, function () {
      expect(req7.body.request.filters.channel).toBeDefined()
      expect(req7.body.request.filters.mimeType).toBeDefined()
      expect(req7.body.request.filters.resourceType).toEqual(whiteList.resourceType)
      expect(req7.body.request.filters.contentType).toEqual(whiteList.contentType)
      expect(req7.body.request.filters.framework).toEqual(whiteList.framework)
    })
  })
=======
describe('Initialization of meta filters', function () {
  it('check for the request and then do next', function () {})
  it('check for no request and get config', function () {})
  it('check for the filter object property exists in the request body', function () {})
  it('if filter object property is equal to response body property then do not append property to filter', function () {})
  it('if the filter object property is not equal to response body property then append property to filter', function () {})
  it('check for getMetaSearchData method creates proper whitelisted search data', function () {})
  it('check for getMetaSearchData method creates proper blacklisted search data', function () {})
>>>>>>> Issue #SB-3715 fix: review fixes
})
