package com.zxb.aiproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;

import javax.servlet.http.HttpServletRequest;

@Controller
public class BaseController {
    /**
     * 在每个请求处理前执行，
     */

    @ModelAttribute
    public void addCommonAttribute(Model model, HttpServletRequest request) {

    String username =  (String) request.getAttribute("username");
    if(username != null){
        model.addAttribute("username", username);
    }else{
        model.addAttribute("username", "管理员");
    }

    //添加其他属性
        model.addAttribute("currentPath",request.getRequestURI());
    }
}
