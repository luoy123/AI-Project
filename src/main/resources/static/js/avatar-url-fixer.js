/**
 * 头像URL格式修复工具
 * 自动将 /upload/ 格式的URL转换为 /api/upload/ 格式
 */

(function() {
    'use strict';
    
    const AvatarUrlFixer = {
        // 修复localStorage中的头像URL
        fixAvatarUrls: function() {
            let fixed = false;
            
            // 修复 userAvatar
            const userAvatar = localStorage.getItem('userAvatar');
            if (userAvatar && userAvatar.startsWith('/upload/')) {
                const fixedUrl = userAvatar.replace('/upload/', '/api/upload/');
                localStorage.setItem('userAvatar', fixedUrl);
                console.log('✅ Fixed userAvatar:', userAvatar, '->', fixedUrl);
                fixed = true;
            }
            
            // 修复 userInfo.avatar
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const info = JSON.parse(userInfo);
                    if (info.avatar && info.avatar.startsWith('/upload/')) {
                        info.avatar = info.avatar.replace('/upload/', '/api/upload/');
                        localStorage.setItem('userInfo', JSON.stringify(info));
                        console.log('✅ Fixed userInfo.avatar:', info.avatar);
                        fixed = true;
                    }
                } catch (e) {
                    console.error('Failed to parse userInfo:', e);
                }
            }
            
            return fixed;
        },
        
        // 检查并修复头像URL（如果需要）
        checkAndFix: function() {
            const fixed = this.fixAvatarUrls();
            if (fixed) {
                console.log('🔧 Avatar URLs have been fixed to use /api/upload/ format');
                
                // 触发头像更新事件
                const newAvatar = localStorage.getItem('userAvatar');
                if (newAvatar) {
                    window.dispatchEvent(new CustomEvent('avatarUpdated', {
                        detail: { avatar: newAvatar }
                    }));
                    console.log('✅ Avatar update event triggered');
                }
            }
        }
    };
    
    // 页面加载时自动检查和修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            AvatarUrlFixer.checkAndFix();
        });
    } else {
        AvatarUrlFixer.checkAndFix();
    }
    
    // 暴露到全局
    window.AvatarUrlFixer = AvatarUrlFixer;
})();
