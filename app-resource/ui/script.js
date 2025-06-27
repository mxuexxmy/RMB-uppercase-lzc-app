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
    new RMBConverter();

    // 复制功能
    const copyBtn = document.getElementById('copyBtn');
    const resultBox = document.getElementById('result');
    copyBtn.addEventListener('click', () => {
        const text = resultBox.innerText.trim();
        if (text && text !== '转换结果将显示在这里') {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = '✅';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span>📋</span>';
                }, 1200);
            });
        }
    });

    // 放大功能
    const zoom1Btn = document.getElementById('zoom1Btn');
    const zoom2Btn = document.getElementById('zoom2Btn');
    const zoom3Btn = document.getElementById('zoom3Btn');
    
    function setZoom(level) {
        // 移除所有放大类
        resultBox.classList.remove('zoom1', 'zoom2', 'zoom3');
        // 移除所有按钮的active状态
        zoom1Btn.classList.remove('active');
        zoom2Btn.classList.remove('active');
        zoom3Btn.classList.remove('active');
        
        if (level > 0) {
            resultBox.classList.add(`zoom${level}`);
            document.getElementById(`zoom${level}Btn`).classList.add('active');
        }
    }
    
    zoom1Btn.addEventListener('click', () => {
        if (resultBox.classList.contains('zoom1')) {
            setZoom(0);
        } else {
            setZoom(1);
        }
    });
    
    zoom2Btn.addEventListener('click', () => {
        if (resultBox.classList.contains('zoom2')) {
            setZoom(0);
        } else {
            setZoom(2);
        }
    });
    
    zoom3Btn.addEventListener('click', () => {
        if (resultBox.classList.contains('zoom3')) {
            setZoom(0);
        } else {
            setZoom(3);
        }
    });
});

// 添加一些便捷的示例点击功能
document.addEventListener('DOMContentLoaded', () => {
    const examples = document.querySelectorAll('.example-input');
    const amountInput = document.getElementById('amount');

    examples.forEach(example => {
        example.addEventListener('click', () => {
            amountInput.value = example.textContent;
            amountInput.focus();
        });
    });
}); 