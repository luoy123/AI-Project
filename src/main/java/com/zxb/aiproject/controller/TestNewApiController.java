package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 测试新API Controller
 */
@Slf4j
@RestController
@RequestMapping("/test-new-api")
public class TestNewApiController {

    @GetMapping("/hello")
    public Result<String> hello() {
        log.info("✅ TestNewApiController is working!");
        return Result.success("Hello from new API!");
    }
}
