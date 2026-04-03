
module.exports = {
    RandomToken: function (length) {
        let result = "";
        let source = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        for (let index = 0; index < length; index++) {
            let ran = Math.floor(Math.random() * source.length);
            result += source.charAt(ran);
        }
        return result;
    }
}