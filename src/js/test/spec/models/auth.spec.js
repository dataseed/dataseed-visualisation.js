define(['models/auth'], function(Auth) {
    /* global describe, beforeEach, expect, it */

    describe('An auth model', function() {

        it('should construct API URLs correctly', function() {
            var auth = new Auth({
                    msg: 'my+test&message',
                    hmac: '798das798das79da'
                });
            expect(auth.getParams()).toBe('auth_msg=my%2Btest%26message&auth_hmac=798das798das79da');
        });

    });

});
