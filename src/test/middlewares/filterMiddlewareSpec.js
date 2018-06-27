describe('Initialization of meta filters', function () {
  it('check for the request with all filter properties and then do next', function () {})
  it('check for no filter property in request, then call getMetaSearchData() to get config', function () {})

  it('check for the filter object (framework) exists in the request body', function () {})
  it('if filter object (framework) is equal to response body property then do not append ' +
  'property to filter', function () {})
  it('if the filter object (framework) is not equal to response body property then append ' +
  'property to filter', function () {})

  it('check for the filter object (channel) exists in the request body', function () {})
  it('if filter object (channel) is equal to response body property then do not append ' +
  'property to filter', function () {})
  it('if the filter object (channel) is not equal to response body property then append ' +
  'property to filter', function () {})

  it('check for the filter object (mimeType) exists in the request body', function () {})
  it('if filter object (mimeType) is equal to response body property then do not append ' +
  'property to filter', function () {})
  it('if the filter object (mimeType) is not equal to response body property then append ' +
  'property to filter', function () {})

  it('check for the filter object (resourceType) exists in the request body', function () {})
  it('if filter object (resourceType) is equal to response body property then do not append ' +
  'property to filter', function () {})
  it('if the filter object (resourceType) is not equal to response body property then append ' +
  'property to filter', function () {})

  it('check for the filter object (contentType) exists in the request body', function () {})
  it('if filter object (contentType) is equal to response body property then do not append ' +
  'property to filter', function () {})
  it('if the filter object (contentType) is not equal to response body property then append ' +
  'property to filter', function () {})

  // negative
  it('if the request filter object (contentType) is equal to response body property then do next()', function () {})
  it('if the request filter object (contentType) is not equal to response body property then do next()', function () {})
  it('if the request filter object (contentType) is defined, and response body is undefined, then do next()', function () {})
})
