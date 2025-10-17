package com.zxb.aiproject.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.zxb.aiproject.config.JwtProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@Slf4j
public class JwtTokenUtil {

    @Autowired
    private JwtProperties jwtProperties;




    /**
     * 生成token
     * @param username
     * @return
     */
    public String generateToken(String username){
        //1.选择一个签名算法
         Algorithm ALGORITHM = Algorithm.HMAC256(jwtProperties.getSecret());

        //2.生成一个过期时间
        Date expiresAt = new Date(System.currentTimeMillis() + jwtProperties.getExpiration());
        return JWT.create()
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(expiresAt)
                .sign(ALGORITHM);
    }

    /**
     * 验证Token
     */
    public boolean verify(String token){
        try{
            //1.选择一个签名算法
            Algorithm ALGORITHM = Algorithm.HMAC256(jwtProperties.getSecret());

            //2，创建一个验证器
            JWTVerifier build = JWT.require(ALGORITHM).build();

            build.verify(token);
            return true;
        }catch(Exception e){
            log.error("token验证失败：{}",e.getMessage());
            return false;
        }

    }

    /**
     * 解析token
     */
    public DecodedJWT parseToken(String token){
        try{
            Algorithm secret = Algorithm.HMAC256(jwtProperties.getSecret());
            JWTVerifier build = JWT.require(secret).build();
            return build.verify(token);
        }catch (Exception e){
            log.error("解析token失败：{}",e.getMessage());
            return null;
        }
    }

    /**
     * 获取用户名
     * @param token
     * @return
     */
    public String getUsername(String token){
        DecodedJWT decodedJWT = parseToken(token);
        return decodedJWT == null ? null : decodedJWT.getSubject();

    }

    /**
     * 判断Token是否过期
     */
    public boolean isTokenExpired(String token){
        DecodedJWT decodedJWT = parseToken(token);
        if(decodedJWT == null){
            return true;
        }
        return decodedJWT.getExpiresAt().before(new Date());
    }

    public Date getExpiration(String token){
        DecodedJWT decodedJWT = parseToken(token);
        return decodedJWT == null ? null : decodedJWT.getExpiresAt();
    }

}
