package com.zxb.aiproject;

import com.zxb.aiproject.utils.Md5Util;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootTest
class AiProjectApplicationTests {

    @Test
    void contextLoads() {
        Md5Util md5Util = new Md5Util();
        String encrypt = md5Util.encrypt("123456");

        System.out.println(encrypt);
    }

}
