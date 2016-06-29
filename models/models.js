/**
 * Created by apple on 16/6/27.
 */
module.exports = {
    poll:{
        user_id: String,
        question: String,
        choices: [{
            text: String,
            votes: Number
        }]
    },
    ip: {
        pool_question_id: String,
        user_id: String,
        ip: String
    }
};