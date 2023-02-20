var mailTemplate = {
    from: "MilkBun<test.techugo@gmail.com>",
    subject: "MilkBun Forgot Password",
    text: "Hi user,<br><br>Please follow the link to recover the password.<a target='_blank' href='http://13.232.62.239:6767/user/verifyForgotLink?email={{email_id}}&forgot_token={{forgot_token}}'>Recover Password</a><br> If it does not work please copy and past link on browser<br><br>Thanks,<br>Team "
}


module.exports = {
    mailTemplate: mailTemplate

}