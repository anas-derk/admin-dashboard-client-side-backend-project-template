const EMAIL_SUBJECTS = {
    verification: {
        ar: "رمز التحقق من الحساب في {{websiteName}}",
        en: "Account verification code on {{websiteName}}",
    },
    welcome: {
        ar: "مرحباً بك في {{websiteName}}",
        en: "Welcome to {{websiteName}}",
    },
    passwordChanged: {
        ar: "تم تغيير كلمة مرور حسابك في {{websiteName}}",
        en: "Your {{websiteName}} password was changed",
    },
    accountDeleted: {
        ar: "تم حذف حسابك من {{websiteName}}",
        en: "Your {{websiteName}} account has been deleted",
    },
};

module.exports = { EMAIL_SUBJECTS };
