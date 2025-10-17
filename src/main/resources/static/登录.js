// 验证码生成函数
function generateCaptcha() {
    const captchaElement = document.getElementById('captchaImage');
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 设置验证码样式
    captchaElement.style.fontFamily = 'Arial, sans-serif';
    captchaElement.style.fontSize = '18px';
    captchaElement.style.letterSpacing = '5px';
    captchaElement.style.color = '#666666';
    captchaElement.style.backgroundColor = '#f5f5f5';
    captchaElement.style.width = '100px';
    captchaElement.style.height = '40px';
    captchaElement.style.display = 'flex';
    captchaElement.style.alignItems = 'center';
    captchaElement.style.justifyContent = 'center';
    captchaElement.style.borderRadius = '4px';
    captchaElement.style.cursor = 'pointer';

    // 添加干扰线
    let interferenceLines = 4;
    let interferenceDots = 20;
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 40;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制文本
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captcha, canvas.width / 2, canvas.height / 2);

    // 绘制干扰线
    for (let i = 0; i < interferenceLines; i++) {
        ctx.strokeStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // 绘制干扰点
    for (let i = 0; i < interferenceDots; i++) {
        ctx.fillStyle = `rgb(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // 将canvas转换为图片
    captchaElement.innerHTML = '';
    captchaElement.appendChild(canvas);

    // 存储验证码用于验证
    window.captchaCode = captcha;
}

// 表单验证
function validateForm() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captcha').value;

    if (!username) {
        alert('请输入用户名');
        return false;
    }

    if (!password) {
        alert('请输入密码');
        return false;
    }

    if (!captcha) {
        alert('请输入验证码');
        return false;
    }

    if (captcha.toUpperCase() !== window.captchaCode.toUpperCase()) {
        alert('验证码错误');
        generateCaptcha(); // 刷新验证码
        return false;
    }

    return true;
}

// 执行登录逻辑
function performLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 显示登录中状态
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;

    // 模拟登录验证过程（可以替换为实际的API调用）
    setTimeout(() => {
        // 简单的用户名密码验证（实际项目中应该调用后端API）
        if (validateCredentials(username, password)) {
            // 登录成功，保存用户信息到localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());

            // 显示成功消息
            alert('登录成功！即将跳转到系统主页...');

            // 跳转到总览页面
            window.location.href = '总览.html';
        } else {
            // 登录失败
            alert('用户名或密码错误，请重试！');

            // 重置按钮状态
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;

            // 刷新验证码
            generateCaptcha();

            // 清空密码字段
            document.getElementById('password').value = '';
            document.getElementById('captcha').value = '';
        }
    }, 1000); // 模拟网络延迟
}

// 验证用户凭据（简单示例，实际项目中应该调用后端API）
function validateCredentials(username, password) {
    // 这里可以添加多个有效的用户名密码组合
    const validUsers = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' },
        { username: 'test', password: 'test123' },
        { username: '管理员', password: '123456' }
    ];

    return validUsers.some(user =>
        user.username === username && user.password === password
    );
}

// 页面加载完成后初始化
window.onload = function() {
    // 生成初始验证码
    generateCaptcha();

    // 点击刷新验证码
    document.getElementById('captchaImage').addEventListener('click', generateCaptcha);

    // 表单提交事件
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            // 表单验证通过，执行登录逻辑
            performLogin();
        }
    });

    // 轮播图功能
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // 验证索引有效性
        if (index < 0 || index >= slides.length) return;

        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function startSlideInterval() {
        // 清除可能存在的旧定时器
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
    }

    // 导航点点击事件
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(index);
            startSlideInterval();
        });
    });

    // 验证DOM元素存在后再启动轮播
    if (slides.length > 0 && dots.length > 0) {
        // 初始显示第一张幻灯片
        showSlide(0);
        // 启动自动轮播
        startSlideInterval();
    } else {
        console.error('轮播图元素未找到');
    }
}