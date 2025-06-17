process.env.NODE_ENV = 'test'
process.env.MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://root:rootpassword@db-test:27017/supchat_test?authSource=admin'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.JWT_REFRESH = 'test_jwt_refresh'
process.env.CSRF_SECRET = 'test_csrf_secret'
