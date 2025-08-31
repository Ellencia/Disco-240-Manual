// Disco240 P1 완전 가이드 JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 탭 내비게이션 초기화
    initTabNavigation();
    
    // 검색 기능 초기화
    initSearchFunction();
    
    // 계산기 기능 초기화
    initCalculators();
    
    // P1 가상 컨트롤 패널 초기화
    initP1ControlPanel();
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts();
    
    console.log('🎛️ Disco240 P1 완전 가이드 애플리케이션이 로드되었습니다.');
});

function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.target.getAttribute('data-tab');
            showTab(targetTab);
        });
    });
    
    function showTab(tabName) {
        // 모든 탭 버튼에서 active 클래스 제거
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // 모든 탭 콘텐츠에서 active 클래스 제거
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 선택된 탭 버튼에 active 클래스 추가
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // 선택된 탭 콘텐츠에 active 클래스 추가
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }
    
    // 초기 탭 설정 (콘솔 조작법)
    showTab('console');
}

function initSearchFunction() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // 디바운스 함수
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    const debouncedSearch = debounce(performSearch, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(e.target.value);
        }
    });
}

function performSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');
    
    // 이전 하이라이트 제거
    removeAllHighlights();
    
    if (!term) {
        // 검색어가 없으면 모든 카드 표시
        cards.forEach(card => {
            card.classList.remove('search-hidden');
        });
        return;
    }
    
    let foundResults = false;
    
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const hasMatch = cardText.includes(term);
        
        if (hasMatch) {
            card.classList.remove('search-hidden');
            highlightSearchTerm(card, term);
            foundResults = true;
        } else {
            card.classList.add('search-hidden');
        }
    });
    
    if (!foundResults) {
        console.log('검색 결과가 없습니다:', searchTerm);
    }
}

function highlightSearchTerm(element, searchTerm) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (node.parentNode.tagName === 'SCRIPT' || 
                    node.parentNode.tagName === 'STYLE' ||
                    node.parentNode.classList?.contains('search-highlight')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        },
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        
        if (regex.test(text)) {
            const highlightedHTML = text.replace(regex, '<span class="search-highlight">$1</span>');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = highlightedHTML;
            
            const parent = textNode.parentNode;
            while (tempDiv.firstChild) {
                parent.insertBefore(tempDiv.firstChild, textNode);
            }
            parent.removeChild(textNode);
        }
    });
}

function removeAllHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function initCalculators() {
    // DMX 값 계산기
    const dmxInput = document.getElementById('dmxValue');
    const dmxResult = document.getElementById('percentResult');
    
    if (dmxInput && dmxResult) {
        dmxInput.addEventListener('input', () => {
            calculateDMXPercentage(dmxInput.value, dmxResult);
        });
        
        dmxInput.addEventListener('keyup', () => {
            calculateDMXPercentage(dmxInput.value, dmxResult);
        });
    }
    
    // RGB 색상 계산기
    const rgbRed = document.getElementById('rgbRed');
    const rgbGreen = document.getElementById('rgbGreen');
    const rgbBlue = document.getElementById('rgbBlue');
    const rgbResult = document.getElementById('rgbResult');
    
    if (rgbRed && rgbGreen && rgbBlue && rgbResult) {
        [rgbRed, rgbGreen, rgbBlue].forEach(input => {
            input.addEventListener('input', () => {
                calculateRGBColor(rgbRed.value, rgbGreen.value, rgbBlue.value, rgbResult);
            });
        });
    }
}

function calculateDMXPercentage(inputValue, resultElement) {
    const dmxValue = parseInt(inputValue);
    
    if (isNaN(dmxValue) || dmxValue < 0 || dmxValue > 255) {
        resultElement.innerHTML = '';
        return;
    }
    
    const percentage = Math.round((dmxValue / 255) * 100);
    const sliderDescription = getSliderDescription(percentage);
    
    resultElement.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong>DMX ${dmxValue}</strong> = <strong style="color: var(--color-primary);">${percentage}%</strong>
        </div>
        <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            슬라이더 위치: ${sliderDescription}
        </div>
    `;
}

function calculateRGBColor(red, green, blue, resultElement) {
    const r = parseInt(red) || 0;
    const g = parseInt(green) || 0;
    const b = parseInt(blue) || 0;
    
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        resultElement.innerHTML = '';
        return;
    }
    
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const colorName = getColorName(r, g, b);
    
    resultElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background-color: rgb(${r}, ${g}, ${b}); border: 1px solid var(--color-border); border-radius: var(--radius-sm);"></div>
            <div>
                <div><strong>RGB(${r}, ${g}, ${b})</strong></div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                    ${hexColor} - ${colorName}
                </div>
            </div>
        </div>
    `;
}

function getSliderDescription(percentage) {
    if (percentage === 0) return '완전히 내림 (OFF)';
    if (percentage <= 10) return '거의 내림';
    if (percentage <= 25) return '1/4 지점';
    if (percentage <= 50) return '중간 지점';
    if (percentage <= 75) return '3/4 지점';
    if (percentage < 100) return '거의 올림';
    return '완전히 올림 (MAX)';
}

function getColorName(r, g, b) {
    if (r >= 200 && g >= 200 && b >= 200) return '흰색계';
    if (r <= 50 && g <= 50 && b <= 50) return '검은색계';
    if (r > g + 50 && r > b + 50) return '빨간색계';
    if (g > r + 50 && g > b + 50) return '녹색계';
    if (b > r + 50 && b > g + 50) return '파란색계';
    if (r > 150 && g > 150 && b < 100) return '노란색계';
    if (r > 150 && g < 100 && b > 150) return '자주색계';
    if (r < 100 && g > 150 && b > 150) return '청록색계';
    if (r > 150 && g > 100 && b < 100) return '주황색계';
    return '혼합색';
}

function initP1ControlPanel() {
    // P1 슬라이더 요소들
    const sliders = {
        dimmer: document.getElementById('p1-dimmer'),
        strobe: document.getElementById('p1-strobe'),
        preset: document.getElementById('p1-preset'),
        red: document.getElementById('p1-red'),
        green: document.getElementById('p1-green'),
        blue: document.getElementById('p1-blue')
    };
    
    const valueDisplays = {
        dimmer: document.getElementById('p1-dimmer-value'),
        strobe: document.getElementById('p1-strobe-value'),
        preset: document.getElementById('p1-preset-value'),
        red: document.getElementById('p1-red-value'),
        green: document.getElementById('p1-green-value'),
        blue: document.getElementById('p1-blue-value')
    };
    
    const colorPreview = document.querySelector('.preview-box');
    
    // 각 슬라이더에 이벤트 리스너 추가
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const display = valueDisplays[key];
        
        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                display.textContent = value;
                updateColorPreview();
                
                // 값이 변경될 때 애니메이션 효과
                display.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    display.style.transform = 'scale(1)';
                }, 150);
            });
        }
    });
    
    function updateColorPreview() {
        const dimmer = parseInt(sliders.dimmer?.value || 0);
        const red = parseInt(sliders.red?.value || 0);
        const green = parseInt(sliders.green?.value || 0);
        const blue = parseInt(sliders.blue?.value || 0);
        
        // 마스터 디머 적용
        const dimmerFactor = dimmer / 255;
        const finalRed = Math.round(red * dimmerFactor);
        const finalGreen = Math.round(green * dimmerFactor);
        const finalBlue = Math.round(blue * dimmerFactor);
        
        if (colorPreview) {
            colorPreview.style.backgroundColor = `rgb(${finalRed}, ${finalGreen}, ${finalBlue})`;
            colorPreview.classList.add('updating');
            setTimeout(() => {
                colorPreview.classList.remove('updating');
            }, 300);
        }
    }
    
    // 초기 색상 설정
    updateColorPreview();
}

// P1 프리셋 함수들 (전역으로 선언하여 HTML에서 호출 가능)
window.setP1Preset = function(preset) {
    const sliders = {
        dimmer: document.getElementById('p1-dimmer'),
        strobe: document.getElementById('p1-strobe'),
        preset: document.getElementById('p1-preset'),
        red: document.getElementById('p1-red'),
        green: document.getElementById('p1-green'),
        blue: document.getElementById('p1-blue')
    };
    
    const valueDisplays = {
        dimmer: document.getElementById('p1-dimmer-value'),
        strobe: document.getElementById('p1-strobe-value'),
        preset: document.getElementById('p1-preset-value'),
        red: document.getElementById('p1-red-value'),
        green: document.getElementById('p1-green-value'),
        blue: document.getElementById('p1-blue-value')
    };
    
    let values = {};
    
    switch (preset) {
        case 'white':
            values = { dimmer: 255, strobe: 0, preset: 0, red: 255, green: 255, blue: 255 };
            break;
        case 'red':
            values = { dimmer: 255, strobe: 0, preset: 0, red: 255, green: 0, blue: 0 };
            break;
        case 'green':
            values = { dimmer: 255, strobe: 0, preset: 0, red: 0, green: 255, blue: 0 };
            break;
        case 'blue':
            values = { dimmer: 255, strobe: 0, preset: 0, red: 0, green: 0, blue: 255 };
            break;
        case 'reset':
            values = { dimmer: 0, strobe: 0, preset: 0, red: 0, green: 0, blue: 0 };
            break;
        default:
            return;
    }
    
    // 슬라이더 값 설정 및 표시 업데이트
    Object.keys(values).forEach(key => {
        const slider = sliders[key];
        const display = valueDisplays[key];
        
        if (slider && display) {
            slider.value = values[key];
            display.textContent = values[key];
            
            // 애니메이션 효과
            display.style.transform = 'scale(1.2)';
            display.style.color = 'var(--color-success)';
            setTimeout(() => {
                display.style.transform = 'scale(1)';
                display.style.color = 'var(--color-primary)';
            }, 300);
        }
    });
    
    // 색상 미리보기 업데이트
    setTimeout(() => {
        const dimmer = parseInt(sliders.dimmer?.value || 0);
        const red = parseInt(sliders.red?.value || 0);
        const green = parseInt(sliders.green?.value || 0);
        const blue = parseInt(sliders.blue?.value || 0);
        
        const dimmerFactor = dimmer / 255;
        const finalRed = Math.round(red * dimmerFactor);
        const finalGreen = Math.round(green * dimmerFactor);
        const finalBlue = Math.round(blue * dimmerFactor);
        
        const colorPreview = document.querySelector('.preview-box');
        if (colorPreview) {
            colorPreview.style.backgroundColor = `rgb(${finalRed}, ${finalGreen}, ${finalBlue})`;
            colorPreview.classList.add('updating');
            setTimeout(() => {
                colorPreview.classList.remove('updating');
            }, 300);
        }
    }, 100);
    
    // 사용자 피드백
    console.log(`P1 프리셋 적용: ${preset}`, values);
};

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + 숫자 키로 탭 전환
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const tabs = ['console', 'p1-device', 'led-spot', 'tips', 'troubleshoot'];
            
            if (tabs[tabIndex]) {
                const tabButton = document.querySelector(`[data-tab="${tabs[tabIndex]}"]`);
                if (tabButton) {
                    tabButton.click();
                }
            }
        }
        
        // Ctrl/Cmd + F로 검색창 포커스
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // P1 프리셋 단축키
        if (e.altKey) {
            switch (e.key) {
                case 'w':
                    e.preventDefault();
                    window.setP1Preset('white');
                    break;
                case 'r':
                    e.preventDefault();
                    window.setP1Preset('red');
                    break;
                case 'g':
                    e.preventDefault();
                    window.setP1Preset('green');
                    break;
                case 'b':
                    e.preventDefault();
                    window.setP1Preset('blue');
                    break;
                case '0':
                    e.preventDefault();
                    window.setP1Preset('reset');
                    break;
            }
        }
    });
}

// 유틸리티 함수들
function animateValue(element, start, end, duration = 500) {
    const startTime = performance.now();
    const change = end - start;
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out 애니메이션
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (change * eased);
        
        element.textContent = Math.round(current);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// DMX 주소 계산 함수 (P1용)
function calculateP1Address() {
    // P1은 DMX 1-7번 고정
    return {
        device: 'P1 조명기',
        startAddress: 1,
        endAddress: 7,
        channels: [
            '채널 1: Master Dimmer',
            '채널 2: Strobe',
            '채널 3: Reserved (미사용)',
            '채널 4: Preset Colors',
            '채널 5: Red',
            '채널 6: Green',
            '채널 7: Blue'
        ]
    };
}

// 색상 조합 저장/로드 기능 (향후 확장 가능)
const savedPresets = {
    warmWhite: { r: 255, g: 200, b: 150, name: '따뜻한 흰색' },
    coolWhite: { r: 200, g: 220, b: 255, name: '차가운 흰색' },
    amber: { r: 255, g: 150, b: 0, name: '앰버' },
    purple: { r: 200, g: 0, b: 255, name: '보라색' },
    cyan: { r: 0, g: 200, b: 255, name: '시안' },
    lime: { r: 150, g: 255, b: 0, name: '라임' }
};

// 디버그 모드에서 추가 정보 출력
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('⌨️ 키보드 단축키:');
    console.log('  - Ctrl/Cmd + 1-5: 탭 전환');
    console.log('  - Ctrl/Cmd + F: 검색창 포커스');
    console.log('  - Alt + W: 흰색 프리셋');
    console.log('  - Alt + R: 빨간색 프리셋');
    console.log('  - Alt + G: 녹색 프리셋');
    console.log('  - Alt + B: 파란색 프리셋');
    console.log('  - Alt + 0: 리셋');
    console.log('🎯 P1 조명기 정보:', calculateP1Address());
    console.log('🎨 저장된 프리셋:', savedPresets);
}

// 에러 처리
window.addEventListener('error', (e) => {
    console.error('애플리케이션 오류:', e.error);
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    console.log('애플리케이션이 종료됩니다.');
});