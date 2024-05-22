const createError = require('http-errors');
const createServer = require('./utils/server');
const app = createServer();

const db = require('./config/db');
db.connect();
console.log(db.connect);



// wrong api
app.all('*', 
    (res: any, req: { req: { originalUrl: any; }; }, next: (arg0: any) => any) => {
        return next(createError.NotFound(`Can't find ${req?.req?.originalUrl} on this server`));
});

// middleware that handling error
app.use(
    (err: { message: any; statusCode: number; status: string; }, req: any, res: { status: (arg0: any) => { (): any; new(): any; json: { (arg0: { success: boolean; status: any; message: any; }): void; new(): any; }; }; }, next: () => void) => {
    console.log(err.message)
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (!err.message) {
        console.log("next");
        next();
    }
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err?.message,
    });
});


app.listen(4000, () => {
  console.log('Listenning on port 4000');
});
