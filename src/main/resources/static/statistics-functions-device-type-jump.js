// 跳转到日志列表页面并应用设备类型筛选
function jumpToLogListByDeviceType(deviceType, deviceTypeName) {
    console.log(`跳转到日志列表-设备类型: ${deviceTypeName} (${deviceType})`);
    
    // 使用通用跳转函数，传递device_type作为filterType
    jumpToLogList('device_type', deviceType, deviceTypeName);
}
