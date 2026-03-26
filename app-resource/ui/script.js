// 数字到中文大写的映射
const numberToChinese = {
    '0': '零', '1': '壹', '2': '贰', '3': '叁', '4': '肆',
    '5': '伍', '6': '陆', '7': '柒', '8': '捌', '9': '玖'
};

// 位数单位
const units = ['', '拾', '佰', '仟'];
const bigUnits = ['', '万', '亿', '万亿'];

// 小数单位
const decimalUnits = ['角', '分'];

class RMBConverter {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const convertBtn = document.getElementById('convertBtn');
        const clearBtn = document.getElementById('clearBtn');
        const amountInput = document.getElementById('amount');

        convertBtn.addEventListener('click', () => this.convert());
        clearBtn.addEventListener('click', () => this.clear());
        
        // 回车键转换
        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convert();
            }
        });

        // 实时输入验证
        amountInput.addEventListener('input', (e) => {
            this.validateInput(e.target.value);
        });
    }

    validateInput(value) {
        const input = document.getElementById('amount');
        const result = document.getElementById('result');
        
        // 只允许数字和小数点
        const cleanValue = value.replace(/[^\d.]/g, '');
        
        // 确保只有一个小数点
        const parts = cleanValue.split('.');
        if (parts.length > 2) {
            const validValue = parts[0] + '.' + parts.slice(1).join('');
            input.value = validValue;
        } else {
            input.value = cleanValue;
        }

        // 限制小数位数最多2位
        if (parts.length === 2 && parts[1].length > 2) {
            input.value = parts[0] + '.' + parts[1].substring(0, 2);
        }

        // 清除之前的错误状态
        input.classList.remove('error');
        result.classList.remove('error');
    }

    convert() {
        const amount = document.getElementById('amount').value.trim();
        const result = document.getElementById('result');

        if (!amount) {
            this.showError('请输入金额');
            return;
        }

        try {
            const num = parseFloat(amount);
            if (isNaN(num) || num < 0) {
                this.showError('请输入有效的金额');
                return;
            }

            if (num > 999999999999.99) {
                this.showError('金额过大，请输入小于1万亿的金额');
                return;
            }

            const chineseAmount = this.toChineseAmount(num);
            this.showResult(chineseAmount);
        } catch (error) {
            this.showError('转换失败，请检查输入格式');
        }
    }

    toChineseAmount(num) {
        // 处理0的情况
        if (num === 0) {
            return '零元整';
        }

        // 分离整数和小数部分
        const [integerPart, decimalPart] = num.toFixed(2).split('.');
        
        let result = '';

        // 处理整数部分
        if (parseInt(integerPart) > 0) {
            result += this.convertInteger(integerPart) + '元';
        }

        // 处理小数部分
        if (decimalPart === '00') {
            result += '整';
        } else {
            const jiao = parseInt(decimalPart[0]);
            const fen = parseInt(decimalPart[1]);

            if (jiao > 0) {
                result += numberToChinese[jiao] + '角';
            }
            if (fen > 0) {
                result += numberToChinese[fen] + '分';
            }
        }

        return result;
    }

    convertInteger(numStr) {
        if (numStr === '0') return '';

        const len = numStr.length;
        let result = '';

        // 按4位分组处理
        const groups = [];
        for (let i = len; i > 0; i -= 4) {
            groups.unshift(numStr.substring(Math.max(0, i - 4), i));
        }

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const groupResult = this.convertGroup(group);
            
            if (groupResult) {
                result += groupResult + bigUnits[groups.length - 1 - i];
            }
        }

        return result;
    }

    convertGroup(groupStr) {
        if (groupStr === '0000') return '';

        let result = '';
        let hasZero = false;
        let lastWasZero = false;

        for (let i = 0; i < groupStr.length; i++) {
            const digit = parseInt(groupStr[i]);
            const position = groupStr.length - 1 - i;

            if (digit === 0) {
                hasZero = true;
                lastWasZero = true;
            } else {
                if (lastWasZero && hasZero) {
                    result += '零';
                }
                result += numberToChinese[digit] + units[position];
                lastWasZero = false;
            }
        }

        return result;
    }

    showResult(text) {
        const result = document.getElementById('result');
        const input = document.getElementById('amount');

        result.innerHTML = text;
        result.className = 'result-box has-result success';
        input.classList.remove('error');
    }

    showError(message) {
        const result = document.getElementById('result');
        const input = document.getElementById('amount');

        result.innerHTML = `<span class="error">${message}</span>`;
        result.className = 'result-box error';
        input.classList.add('error');
    }

    clear() {
        const input = document.getElementById('amount');
        const result = document.getElementById('result');

        input.value = '';
        result.innerHTML = '<span class="placeholder">转换结果将显示在这里</span>';
        result.className = 'result-box';
        input.classList.remove('error');
        input.focus();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = String(new Date().getFullYear());
    }

    new RMBConverter();

    // 复制功能
    const copyBtn = document.getElementById('copyBtn');
    const resultBox = document.getElementById('result');
    const resultFeedback = document.getElementById('resultFeedback');

    function setFeedback(message) {
        if (resultFeedback) {
            resultFeedback.textContent = message;
        }
    }

    copyBtn.addEventListener('click', () => {
        const text = resultBox.innerText.trim();
        if (text && text !== '转换结果将显示在这里') {
            navigator.clipboard.writeText(text).then(
                () => {
                    copyBtn.textContent = '已复制';
                    setFeedback('结果已复制到剪贴板。');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span class="tool-text">复制</span>';
                    }, 1200);
                },
                () => {
                    setFeedback('复制失败，请手动选中结果文本后复制。');
                }
            );
        } else {
            setFeedback('暂无可复制内容，请先完成转换。');
        }
    });

    // 缩放功能（加减步进）
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomLevel = document.getElementById('zoomLevel');
    const minZoom = 1;
    const maxZoom = 10;
    const baseFontSizeRem = 1.08;
    const basePaddingPx = 16;
    let currentZoom = 1;

    function applyZoom() {
        resultBox.classList.remove('zoom1', 'zoom2', 'zoom3');
        if (currentZoom <= 3) {
            resultBox.classList.add(`zoom${currentZoom}`);
            resultBox.style.fontSize = '';
            resultBox.style.padding = '';
        } else {
            resultBox.style.fontSize = `${(baseFontSizeRem * currentZoom).toFixed(2)}rem`;
            resultBox.style.padding = `${basePaddingPx + currentZoom * 8}px`;
        }
        zoomLevel.textContent = `${currentZoom}x`;
        zoomOutBtn.disabled = currentZoom === minZoom;
        zoomInBtn.disabled = currentZoom === maxZoom;
        setFeedback(`当前显示倍率 ${currentZoom}x`);
    }

    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= 1;
            applyZoom();
        }
    });

    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += 1;
            applyZoom();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!event.altKey) return;

        if (event.key === '=' || event.key === '+') {
            if (currentZoom < maxZoom) {
                currentZoom += 1;
                applyZoom();
            }
            event.preventDefault();
        }

        if (event.key === '-' || event.key === '_') {
            if (currentZoom > minZoom) {
                currentZoom -= 1;
                applyZoom();
            }
            event.preventDefault();
        }
    });

    applyZoom();
});

// 添加一些便捷的示例点击功能
document.addEventListener('DOMContentLoaded', () => {
    const examples = document.querySelectorAll('.example-input');
    const amountInput = document.getElementById('amount');

    examples.forEach(example => {
        example.setAttribute('tabindex', '0');
        example.setAttribute('role', 'button');
        example.setAttribute('aria-label', `使用示例金额 ${example.textContent}`);

        example.addEventListener('click', () => {
            amountInput.value = example.textContent;
            amountInput.focus();
        });

        example.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                amountInput.value = example.textContent;
                amountInput.focus();
            }
        });
    });
}); 