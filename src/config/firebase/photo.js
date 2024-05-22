const multer = require('multer');

class Photo {
    upload = multer({ storage: multer.memoryStorage() }).single('avatar');

    giveCurrentDateTime = () => {
        const today = new Date();
        const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        const dateTime = date + ' ' + time;
        return dateTime;
    }

}

module.exports = new Photo();