package com.zxb.aiproject.controller;

import com.zxb.aiproject.common.result.Result;
import com.zxb.aiproject.entity.Alert;
import com.zxb.aiproject.service.AlertService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/alert")
@Api(tags="告警管理")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping("/list")
    @ApiOperation("获取告警列表")
    public Result<List< Alert>> getAlerts(@RequestParam(required = false) String severity,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(required = false) String deviceType,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) String alertCategory,
                                          @RequestParam(required = false) String startTime,
                                          @RequestParam(required = false) String endTime){
        log.info("获取告警列表，参数：severity={},status={},deviceType={},keyword={},alertCategory={},startTime={},endTime={}",
                severity,status,deviceType,keyword,alertCategory,startTime,endTime);
        return Result.success(alertService.filterAlerts(severity,status,deviceType,keyword,alertCategory,startTime,endTime));

    }

    @GetMapping("/statistics")
    @ApiOperation("获取告警统计")
    public Result<Map<String,Object>> getStatistics(){
        log.info("获取告警统计");
        return Result.success(alertService.getStatistics());
    }

    @GetMapping("/recent")
    @ApiOperation("获取最近告警列表")
    public Result<List<Alert>> getRecentAlerts(@RequestParam(defaultValue = "10") Integer limit) {
        log.info("获取最近{}条告警", limit);
        List<Alert> alerts = alertService.getRecentAlerts(limit);
        return Result.success(alerts);
    }

    /**
     *根据ID获取告警详情
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    @ApiOperation("获取告警详情")
    public Result<Alert> getAlertById(@PathVariable String id){
        log.info("获取告警详情，参数：id={}",id);
        Alert alertById = alertService.getAlertById(id);
        if(alertById == null){
            return Result.error("告警不存在");
        }
        return Result.success(alertById);
    }

    @GetMapping("/add")
    @ApiOperation("添加告警")
    public Result<String> addAlert(@RequestParam Alert alert){
        log.info("添加告警，参数：{}",alert);
        if(alertService.addAlert(alert)){
            return Result.success("添加成功");
        }
        return Result.error("添加失败");
    }

    @GetMapping("/update")
    @ApiOperation("更新告警")
    public Result<String> updateAlert(@RequestParam Alert alert){
        log.info("更新告警，参数：{}",alert);
        if(alertService.updateAlert(alert)){
            return Result.success("更新成功");
        }
        return Result.error("更新失败");
    }

    @GetMapping("/delete")
    @ApiOperation("删除告警")
    public Result<String> deleteAlert(@RequestParam Long id){
        log.info("删除告警，参数：id={}",id);
        if(alertService.deleteAlert(id)){
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }

    @PutMapping("/acknowledge/{id}")
    @ApiOperation("确认告警")
    public Result<String> acknowledgeAlert(@PathVariable Long id, HttpServletRequest  request){
        String username = (String)request.getAttribute("username");
        log.info("确认告警，参数：id={},username={}",id,username);

        boolean success = alertService.acknowledgeAlert(id, username);
        if(success){
            return Result.success("确认成功");
        }
        return Result.error("确认失败");
    }

    @PutMapping("/resolve/{id}")
    @ApiOperation("解决告警")
    public Result<String> resolveAlert(@PathVariable Long id, HttpServletRequest  request){
        String username = (String)request.getAttribute("username");
        log.info("解决告警，参数：id={},username={}",id,username);
        boolean success = alertService.resolveAlert(id, username);
        if(success){
            return Result.success("解决成功");
        }
        return Result.error("解决失败");
    }

    @GetMapping("/trend")
    @ApiOperation("获取告警趋势")
    public Result<Map<String,Object>> getAlertTrend(){
        log.info("获取告警趋势");
        return Result.success(alertService.getAlertTrend());
    }


}
