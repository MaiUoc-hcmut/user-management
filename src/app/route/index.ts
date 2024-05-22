const adminRouter = require('./admin');
const studentRouter = require('./studentRoute');
const studentAuthRouter = require('./studentAuthRoute');
const teacherRouter = require('./teacherRoute');
const teacherAuthRouter = require('./teacherAuthRoute');
const reviewRouter = require('./review');
const commonRouter = require('./common');

function route(app: any) {
    app.use('/api/v1/auth', studentAuthRouter);
    app.use('/api/v1/student', studentRouter);
    app.use('/api/v1/auth-teacher', teacherAuthRouter);
    app.use('/api/v1/teacher', teacherRouter);
    app.use('/api/v1/admin', adminRouter);
    app.use('/api/v1/reviews', reviewRouter);
    app.use('/api/v1/commons', commonRouter);
}

module.exports = route;

export {};