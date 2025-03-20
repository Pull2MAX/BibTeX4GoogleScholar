// ==UserScript==
// @name         谷歌学术BibTeX一键复制（极简版）
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  在谷歌学术搜索结果中添加一键复制BibTeX按钮，使用微型弹窗自动复制
// @author       You
// @match        https://scholar.google.com/*
// @match        https://scholar.google.com.hk/*
// @match        https://scholar.google.com.cn/*
// @match        https://scholar.google.co*/scholar*
// @match        https://scholar.googleusercontent.com/scholar.bib*
// @grant        GM_setClipboard
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';

    // 在BibTeX内容页面执行自动复制
    if (window.location.href.includes('scholar.bib')) {
        // 设置页面背景颜色为深色，减少视觉冲击
        document.body.style.backgroundColor = "#333";
        document.body.style.color = "#fff";

        // 快速获取BibTeX内容并复制
        setTimeout(function() {
            const preElement = document.querySelector('pre');
            if (preElement && preElement.textContent) {
                try {
                    GM_setClipboard(preElement.textContent);

                    // 添加成功提示
                    const notification = document.createElement('div');
                    notification.style.position = 'fixed';
                    notification.style.top = '0';
                    notification.style.left = '0';
                    notification.style.right = '0';
                    notification.style.backgroundColor = '#4CAF50';
                    notification.style.color = 'white';
                    notification.style.padding = '10px';
                    notification.style.textAlign = 'center';
                    notification.style.fontSize = '16px';
                    notification.style.zIndex = '9999';
                    notification.textContent = 'BibTeX 已复制到剪贴板! 此窗口将在1秒后自动关闭';
                    document.body.insertBefore(notification, document.body.firstChild);

                    // 0.8秒后自动关闭窗口
                    setTimeout(window.close, 800);
                } catch (e) {
                    console.error("复制失败:", e);
                }
            }
        }, 100); // 减少延迟，加快处理速度
    }
    // 在谷歌学术搜索结果页面添加复制按钮
    else if (window.location.href.includes('scholar.google.')) {
        // 添加按钮样式
        const style = document.createElement('style');
        style.textContent = `
            .quick-copy-btn {
                background-color: #4285f4;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 3px 8px;
                margin-right: 8px;
                cursor: pointer;
                font-size: 12px;
                display: inline-block;
                text-decoration: none;
            }
            .quick-copy-btn:hover {
                background-color: #3367d6;
            }
        `;
        document.head.appendChild(style);

        // 添加复制按钮到搜索结果
        function addCopyButtons() {
            document.querySelectorAll('a').forEach(link => {
                if (link.textContent === "导入BibTeX") {
                    // 避免重复添加按钮
                    if (link.parentNode.querySelector('.quick-copy-btn')) return;

                    const copyBtn = document.createElement('a');
                    copyBtn.className = 'quick-copy-btn';
                    copyBtn.textContent = '一键复制';
                    copyBtn.href = 'javascript:void(0);';
                    copyBtn.onclick = function(e) {
                        e.preventDefault();

                        // 打开1x1像素的弹窗，位于屏幕外
                        const bibtexUrl = link.href;
                        window.open(
                            bibtexUrl,
                            '_blank',
                            'width=1,height=1,left=-10000,top=-10000'
                        );
                    };

                    link.parentNode.insertBefore(copyBtn, link);
                }
            });
        }

        // 初始化和监听DOM变化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addCopyButtons);
        } else {
            addCopyButtons();
        }

        new MutationObserver(addCopyButtons).observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
