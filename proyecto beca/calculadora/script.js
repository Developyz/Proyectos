class NeoCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.expression = document.getElementById('expression');
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.isNewCalculation = false;
        
        this.initKeyboardListeners();
        this.addSoundEffects();
    }
    
    initKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            
            const key = e.key;
            
            if ('0123456789'.includes(key)) {
                this.inputNumber(key);
            } else if ('+-*/'.includes(key)) {
                this.inputOperator(key);
            } else if (key === '=' || key === 'Enter') {
                this.calculate();
            } else if (key === '.' || key === ',') {
                this.inputDecimal();
            } else if (key === 'Backspace') {
                this.deleteLast();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                this.clearAll();
            }
        });
    }
    
    addSoundEffects() {
        // Crear contexto de audio para efectos de sonido
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
    
    playSound(frequency = 800, duration = 100) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    updateDisplay() {
        this.display.textContent = this.formatNumber(this.currentInput);
        
        if (this.previousInput && this.operator) {
            this.expression.textContent = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            this.expression.textContent = '';
        }
        
        // Animación del display
        this.display.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.display.style.transform = 'scale(1)';
        }, 100);
    }
    
    formatNumber(num) {
        if (num.toString().length > 12) {
            if (num > 999999999999) {
                return Number(num).toExponential(4);
            }
        }
        
        return parseFloat(num).toLocaleString('es-ES', { 
            maximumFractionDigits: 8,
            useGrouping: true 
        });
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '**': 'x²'
        };
        return symbols[op] || op;
    }
    
    inputNumber(num) {
        this.playSound(600, 80);
        
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            if (this.isNewCalculation) {
                this.currentInput = num;
                this.isNewCalculation = false;
            } else {
                this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
            }
        }
        
        this.updateDisplay();
    }
    
    inputDecimal() {
        this.playSound(700, 80);
        
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.toString().indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        this.playSound(500, 120);
        
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation();
            
            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.isNewCalculation = false;
        this.updateDisplay();
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return current;
        
        let result;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Error: División por cero');
                    return 0;
                }
                result = prev / current;
                break;
            case '**':
                result = Math.pow(prev, 2);
                break;
            default:
                return current;
        }
        
        return result;
    }
    
    calculate() {
        this.playSound(400, 150);
        
        if (this.operator && !this.waitingForOperand) {
            this.currentInput = String(this.performCalculation());
            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
            this.isNewCalculation = true;
        }
        
        this.updateDisplay();
        
        // Efecto especial para el resultado
        this.display.style.color = '#00ff88';
        this.display.style.textShadow = '0 0 30px #00ff88';
        setTimeout(() => {
            this.display.style.color = 'white';
            this.display.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
        }, 500);
    }
    
    clearAll() {
        this.playSound(300, 100);
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.isNewCalculation = false;
        this.updateDisplay();
    }
    
    clearEntry() {
        this.playSound(350, 100);
        this.currentInput = '0';
        this.updateDisplay();
    }
    
    deleteLast() {
        this.playSound(450, 80);
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        
        this.updateDisplay();
    }
    
    showError(message) {
        this.display.textContent = message;
        this.display.classList.add('error');
        this.playSound(200, 300);
        
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clearAll();
        }, 2000);
    }
}

// Funciones globales para los eventos onclick
let calculator;

function initCalculator() {
    calculator = new NeoCalculator();
}

function inputNumber(num) {
    calculator.inputNumber(num);
}

function inputOperator(op) {
    calculator.inputOperator(op);
}

function inputDecimal() {
    calculator.inputDecimal();
}

function calculate() {
    calculator.calculate();
}

function clearAll() {
    calculator.clearAll();
}

function clearEntry() {
    calculator.clearEntry();
}

function deleteLast() {
    calculator.deleteLast();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initCalculator);

// Easter egg: Konami code
let konamiCode = [];
const konami = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join('') === konami.join('')) {
        // Activar modo rainbow
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 10000);
    }
});

// Keyframes para el easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);