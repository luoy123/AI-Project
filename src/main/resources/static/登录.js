// 验证码生成函数
let captchaKey = '';
// 从后端获取验证码
function generateCaptcha() {
    fetch('http://localhost:8080/api/user/captcha')
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 保存验证码key
                captchaKey = data.data.key;
                // 显示Base64验证码图片（后端已返回完整的data URI）
                document.getElementById('captchaImage').src = data.data.image;
            } else {
                console.error('获取验证码失败:', data.message);
            }
        })
        .catch(error => {
            console.error('获取验证码请求失败:', error);
        });
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

    // 验证码校验移到后端进行，前端只检查是否输入
    if (!captcha) {
        alert('请输入验证码');
        return false;
    }

    return true;
}

// 执行登录逻辑
// 执行登录逻辑
function performLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captcha').value;

    // 显示登录中状态
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;

    // 调用后端登录API
    fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password,
            captcha: captcha,
            captchaKey: captchaKey  // 传递验证码key
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 登录成功
                const loginData = data.data;

                // 保存token和用户信息
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('userInfo', JSON.stringify(loginData.userInfo));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', loginData.userInfo.username);
                localStorage.setItem('loginTime', new Date().toISOString());

                alert('登录成功！即将跳转到系统主页...');
                window.location.href = 'http://localhost:8080/api/总览.html';
            } else {
                // 登录失败
                alert(data.message || '登录失败，请重试！');

                // 重置按钮状态
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;

                // 刷新验证码
                generateCaptcha();

                // 清空密码和验证码
                document.getElementById('password').value = '';
                document.getElementById('captcha').value = '';
            }
        })
        .catch(error => {
            console.error('登录请求失败:', error);
            alert('网络错误，请检查后端服务是否启动');

            // 重置按钮状态
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 加载验证码
    generateCaptcha();

    // 绑定验证码图片点击事件，点击刷新
    document.getElementById('captchaImage').addEventListener('click', function() {
        generateCaptcha();
    });

    // 绑定表单提交事件
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交
        if (validateForm()) {
            performLogin();
        }
    });
});