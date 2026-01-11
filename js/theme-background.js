// 完整的主题背景控制
(function() {
    'use strict';
    
    console.log('🎨 主题背景控制器启动');
    
    // 配置
    const config = {
        light: {
            image: '/ds.png',
            color: 'transparent'
        },
        dark: {
            image: '/dr.png',
            color: 'transparent'
        }
    };
    
    // 1. 添加CSS样式（最高优先级）
    function injectCSS() {
        const styleId = 'theme-background-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 强制背景控制 */
            body.theme-bg-controlled {
                background-image: var(--theme-bg-image, none) !important;
                background-size: cover !important;
                background-attachment: fixed !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                min-height: 100vh !important;
                background-color: transparent !important;
                transition: background-image 0.3s ease !important;
            }
            
            /* 使用CSS变量控制 */
            html[data-scheme="light"] {
                --theme-bg-image: url('/ds.png');
            }
            
            html[data-scheme="dark"] {
                --theme-bg-image: url('/dr.png');
            }
            
            /* 覆盖内联样式 */
            body[style*="background"] {
                background-image: var(--theme-bg-image, none) !important;
                background-color: transparent !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS样式已注入');
    }
    
    // 2. 设置背景
    function setBackground() {
        const scheme = document.documentElement.getAttribute('data-scheme') || 'light';
        const bgConfig = config[scheme];
        
        console.log(`🔄 设置背景: ${scheme}模式 -> ${bgConfig.image}`);
        
        // 添加控制类
        document.body.classList.add('theme-bg-controlled');
        
        // 方法A：使用CSS变量（通过已注入的CSS）
        document.documentElement.style.setProperty('--theme-bg-image', `url('${bgConfig.image}')`);
        
        // 方法B：直接设置内联样式（双重保障）
        const bgStyle = `
            background-image: url('${bgConfig.image}') !important;
            background-size: cover !important;
            background-attachment: fixed !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            min-height: 100vh !important;
            background-color: ${bgConfig.color} !important;
        `;
        
        // 合并现有样式
        let currentStyle = document.body.getAttribute('style') || '';
        // 移除旧的背景样式
        currentStyle = currentStyle.replace(/background[^;]*!important\s*;/g, '');
        currentStyle = currentStyle.replace(/background-[^;]*!important\s*;/g, '');
        
        document.body.setAttribute('style', currentStyle + bgStyle);
        
        // 方法C：设置data属性
        document.body.setAttribute('data-theme-bg', scheme);
        
        console.log(`✅ 背景已设置为: ${bgConfig.image}`);
    }
    
    // 3. 监听主题切换
    function setupThemeObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-scheme') {
                    console.log('🎯 检测到主题切换');
                    // 立即更新
                    setBackground();
                    // 延迟再次确认（防止被覆盖）
                    setTimeout(setBackground, 50);
                    setTimeout(setBackground, 200);
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-scheme']
        });
        
        // 监听body变化
        const bodyObserver = new MutationObserver(function() {
            // 检查背景是否被修改
            const currentBg = document.body.style.backgroundImage || '';
            const scheme = document.documentElement.getAttribute('data-scheme') || 'light';
            const expectedBg = config[scheme].image;
            
            if (!currentBg.includes(expectedBg)) {
                console.log('⚠️ 检测到背景被覆盖，重新设置');
                setBackground();
            }
        });
        
        bodyObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            attributeOldValue: true
        });
        
        console.log('👁️ 主题监听器已启动');
    }
    
    // 4. 防覆盖机制
    function setupProtection() {
        // 拦截可能覆盖背景的样式操作
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        CSSStyleDeclaration.prototype.setProperty = function() {
            if (arguments[0] && arguments[0].includes('background') && 
                this === document.body.style) {
                console.log('🚫 拦截了背景样式修改:', arguments);
                // 允许设置，但我们会立即用我们的覆盖
                const result = originalSetProperty.apply(this, arguments);
                setTimeout(setBackground, 10);
                return result;
            }
            return originalSetProperty.apply(this, arguments);
        };
        
        // 覆盖style直接赋值
        Object.defineProperty(document.body, 'style', {
            get: function() {
                return this._style || 
                       Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style').get.call(this);
            },
            set: function(value) {
                if (typeof value === 'string' && value.includes('background')) {
                    console.log('🚫 拦截了style赋值');
                    // 合并而非覆盖
                    const current = this.style.cssText;
                    this._style = current + ';' + value;
                    setTimeout(setBackground, 10);
                } else {
                    this._style = value;
                }
            },
            configurable: true
        });
    }
    
    // 5. 初始化
    function init() {
        // 注入CSS
        injectCSS();
        
        // 设置初始背景
        setBackground();
        
        // 启动监听
        setupThemeObserver();
        
        // 设置保护（可选，如果主题有激烈对抗）
        // setupProtection();
        
        // 多次确认设置
        setTimeout(setBackground, 100);
        setTimeout(setBackground, 500);
        setTimeout(setBackground, 1000);
        
        console.log('🚀 主题背景控制器初始化完成');
    }
    
    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 导出函数供调试
    window.themeBackground = {
        setBackground: setBackground,
        forceUpdate: function() {
            console.log('🔄 强制更新背景');
            setBackground();
        },
        getCurrentTheme: function() {
            return document.documentElement.getAttribute('data-scheme') || 'light';
        }
    };
    
})();