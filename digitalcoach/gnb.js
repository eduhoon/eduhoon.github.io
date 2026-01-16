// GNB Menu Interactions - Event Delegation 방식

// 모바일 여부 체크 함수
function isMobile() {
    return window.innerWidth < 768;
}

// 포커스 트랩 활성화/비활성화를 위한 핸들러 저장
let focusTrapHandler = null;

// 포커스 트랩 함수
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 이전 핸들러 제거
    if (focusTrapHandler) {
        element.removeEventListener('keydown', focusTrapHandler);
    }

    // 새 핸들러 생성 및 저장
    focusTrapHandler = function(event) {
        if (event.key === 'Tab') {
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    };

    element.addEventListener('keydown', focusTrapHandler);
}

// 포커스 트랩 제거
function removeFocusTrap(element) {
    if (focusTrapHandler) {
        element.removeEventListener('keydown', focusTrapHandler);
        focusTrapHandler = null;
    }
}

// 메뉴 닫기
function closeMenu() {
    const gnbMenu = document.querySelector('.gnb-menu');
    const hamburger = document.querySelector('.gnb-hamburger');
    const overlay = document.querySelector('.gnb-overlay');
    const body = document.body;
    const menuItems = document.querySelectorAll('.gnb-menu-item');

    if (gnbMenu) {
        gnbMenu.classList.remove('active');
        removeFocusTrap(gnbMenu);
    }

    if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', '메뉴 열기');
        // 햄버거 버튼으로 포커스 복귀
        if (isMobile()) {
            hamburger.focus();
        }
    }

    if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }

    body.classList.remove('menu-open');

    // 모든 아코디언 닫기 및 ARIA 업데이트
    menuItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector(':scope > a');
        const submenu = item.querySelector('.gnb-submenu');
        if (link && submenu) {
            link.setAttribute('aria-expanded', 'false');
        }
    });
}

// Document 클릭 이벤트
document.addEventListener('click', function(event) {
    const target = event.target;

    // 햄버거 버튼 클릭 (버튼 자체 또는 자식 span 클릭)
    const hamburger = target.closest('.gnb-hamburger');
    if (hamburger) {
        const gnbMenu = document.querySelector('.gnb-menu');
        const overlay = document.querySelector('.gnb-overlay');
        const body = document.body;

        if (!gnbMenu || !overlay) return;

        const isActive = gnbMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        overlay.classList.toggle('active');

        // ARIA 속성 업데이트
        hamburger.setAttribute('aria-expanded', isActive);
        hamburger.setAttribute('aria-label', isActive ? '메뉴 닫기' : '메뉴 열기');
        overlay.setAttribute('aria-hidden', !isActive);

        // Body 스크롤 방지
        if (isActive) {
            body.classList.add('menu-open');
            // 첫 번째 메뉴 항목으로 포커스 이동
            const firstMenuItem = gnbMenu.querySelector('a');
            if (firstMenuItem) {
                // 약간의 지연 후 포커스 (애니메이션 완료 대기)
                setTimeout(() => {
                    firstMenuItem.focus();
                }, 100);
            }
            // 포커스 트랩 활성화
            trapFocus(gnbMenu);
        } else {
            body.classList.remove('menu-open');
            removeFocusTrap(gnbMenu);
            closeMenu();
        }
        return;
    }

    // 오버레이 클릭
    if (target.classList.contains('gnb-overlay')) {
        closeMenu();
        return;
    }

    // 아코디언 토글 (모바일에서만)
    // 클릭된 링크가 서브메뉴를 가진 메뉴 아이템인지 확인
    const clickedLink = target.closest('.gnb-menu-item > a');
    if (clickedLink && isMobile()) {
        const menuItem = clickedLink.parentElement;
        const hasSubmenu = menuItem.querySelector('.gnb-submenu');

        if (hasSubmenu) {
            const menuItems = document.querySelectorAll('.gnb-menu-item');
            const isExpanded = menuItem.classList.contains('active');

            // 다른 아코디언 모두 닫기 및 ARIA 업데이트
            menuItems.forEach(item => {
                if (item !== menuItem) {
                    item.classList.remove('active');
                    const link = item.querySelector(':scope > a');
                    const submenu = item.querySelector('.gnb-submenu');
                    if (link && submenu) {
                        link.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            // 현재 아코디언 토글
            menuItem.classList.toggle('active');

            // ARIA 속성 업데이트
            clickedLink.setAttribute('aria-expanded', !isExpanded);

            // 기본 링크 동작 방지
            event.preventDefault();
            return;
        }
    }

    // 서브메뉴 내부 링크 클릭 (모바일에서 메뉴 닫기)
    const submenuLink = target.closest('.gnb-submenu a');
    if (submenuLink && isMobile()) {
        closeMenu();
        return;
    }
});

// ESC 키로 메뉴 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const gnbMenu = document.querySelector('.gnb-menu');
        if (gnbMenu && gnbMenu.classList.contains('active')) {
            closeMenu();
        }
    }
});

// 화면 크기 변경 시 처리
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // 태블릿/PC로 전환 시 모바일 메뉴 상태 초기화
        if (!isMobile()) {
            closeMenu();
        }
    }, 250);
});

// 현재 페이지 활성화 (페이지 로드 시 실행)
function setActivePage() {
    const currentHash = window.location.hash || '#home';
    const currentPath = window.location.pathname;
    const allLinks = document.querySelectorAll('.gnb-menu a');

    // 모든 링크에서 current 클래스 제거
    allLinks.forEach(link => {
        link.classList.remove('current');
    });

    let matchedLink = null;
    let isSubmenuMatch = false;

    // 각 링크 확인하여 가장 구체적인 매칭 찾기
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        let isActive = false;

        // href가 해시(#)로 시작하는 경우
        if (href && href.startsWith('#')) {
            if (href === currentHash) {
                isActive = true;
                // 서브메뉴 항목이면 우선순위 높게 설정
                const submenu = link.closest('.gnb-submenu');
                if (submenu) {
                    matchedLink = link;
                    isSubmenuMatch = true;
                } else if (!isSubmenuMatch) {
                    // 서브메뉴 매칭이 없을 때만 메인 메뉴 매칭
                    matchedLink = link;
                }
            }
        }
        // href가 절대 경로 또는 상대 경로인 경우
        else if (href) {
            try {
                const linkUrl = new URL(href, window.location.origin);
                const linkPath = linkUrl.pathname;

                // 경로 비교 (도메인과 해시 제외)
                if (linkPath === currentPath) {
                    isActive = true;
                    const submenu = link.closest('.gnb-submenu');
                    if (submenu) {
                        matchedLink = link;
                        isSubmenuMatch = true;
                    } else if (!isSubmenuMatch) {
                        matchedLink = link;
                    }
                }
                // 링크가 루트(/)이고 현재도 루트면 활성화
                else if (linkPath === '/' && currentPath === '/' && !isSubmenuMatch) {
                    matchedLink = link;
                }
                // 현재 경로가 링크 경로로 시작하면 활성화 (하위 경로 포함)
                else if (currentPath.startsWith(linkPath) && linkPath !== '/' && !isSubmenuMatch) {
                    // 더 긴 경로가 더 구체적이므로 우선
                    if (!matchedLink || linkPath.length > matchedLink.getAttribute('href').length) {
                        matchedLink = link;
                    }
                }
            } catch (e) {
                // URL 파싱 실패 시 문자열 비교
                if (href === currentPath && !isSubmenuMatch) {
                    matchedLink = link;
                }
            }
        }
    });

    // 매칭된 링크에만 current 클래스 및 aria-current 추가
    if (matchedLink) {
        matchedLink.classList.add('current');
        matchedLink.setAttribute('aria-current', 'page');

        // 서브메뉴 항목이면 부모 메뉴도 활성화
        const submenu = matchedLink.closest('.gnb-submenu');
        if (submenu) {
            const parentLink = submenu.parentElement.querySelector(':scope > a');
            if (parentLink) {
                parentLink.classList.add('current');
            }
        }
    }
}

// 데스크톱 드롭다운 키보드 네비게이션
document.addEventListener('keydown', function(event) {
    // 모바일에서는 키보드 네비게이션 비활성화
    if (isMobile()) return;

    const focusedElement = document.activeElement;
    const menuItem = focusedElement.closest('.gnb-menu-item');

    // 서브메뉴가 있는 메뉴 항목에 포커스가 있을 때
    if (menuItem && menuItem.querySelector('.gnb-submenu')) {
        const link = menuItem.querySelector(':scope > a');
        const submenu = menuItem.querySelector('.gnb-submenu');

        // Enter 또는 Space: 서브메뉴 토글
        if (event.key === 'Enter' || event.key === ' ') {
            if (focusedElement === link) {
                event.preventDefault();
                const isExpanded = menuItem.classList.contains('active');

                // 모든 서브메뉴 닫기
                document.querySelectorAll('.gnb-menu-item.active').forEach(item => {
                    if (item !== menuItem) {
                        item.classList.remove('active');
                        const itemLink = item.querySelector(':scope > a');
                        if (itemLink) itemLink.setAttribute('aria-expanded', 'false');
                    }
                });

                // 현재 서브메뉴 토글
                menuItem.classList.toggle('active');
                link.setAttribute('aria-expanded', !isExpanded);

                // 서브메뉴 열었으면 첫 번째 항목으로 포커스 이동
                if (!isExpanded) {
                    const firstSubmenuLink = submenu.querySelector('a');
                    if (firstSubmenuLink) {
                        setTimeout(() => firstSubmenuLink.focus(), 50);
                    }
                }
            }
        }

        // Arrow Down: 서브메뉴 열고 첫 항목으로 이동
        if (event.key === 'ArrowDown') {
            if (focusedElement === link) {
                event.preventDefault();
                menuItem.classList.add('active');
                link.setAttribute('aria-expanded', 'true');
                const firstSubmenuLink = submenu.querySelector('a');
                if (firstSubmenuLink) {
                    firstSubmenuLink.focus();
                }
            }
        }

        // Escape: 서브메뉴 닫기
        if (event.key === 'Escape') {
            event.preventDefault();
            menuItem.classList.remove('active');
            link.setAttribute('aria-expanded', 'false');
            link.focus();
        }
    }

    // 서브메뉴 내부에서 Arrow 키 탐색
    if (focusedElement.closest('.gnb-submenu')) {
        const submenu = focusedElement.closest('.gnb-submenu');
        const submenuLinks = Array.from(submenu.querySelectorAll('a'));
        const currentIndex = submenuLinks.indexOf(focusedElement);

        // Arrow Down: 다음 서브메뉴 항목
        if (event.key === 'ArrowDown' && currentIndex < submenuLinks.length - 1) {
            event.preventDefault();
            submenuLinks[currentIndex + 1].focus();
        }

        // Arrow Up: 이전 서브메뉴 항목 또는 부모로
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex > 0) {
                submenuLinks[currentIndex - 1].focus();
            } else {
                // 첫 번째 항목에서 Up 누르면 부모 링크로
                const parentItem = submenu.closest('.gnb-menu-item');
                const parentLink = parentItem.querySelector(':scope > a');
                if (parentLink) parentLink.focus();
            }
        }

        // Escape: 서브메뉴 닫고 부모로 포커스
        if (event.key === 'Escape') {
            event.preventDefault();
            const parentItem = submenu.closest('.gnb-menu-item');
            const parentLink = parentItem.querySelector(':scope > a');
            parentItem.classList.remove('active');
            if (parentLink) {
                parentLink.setAttribute('aria-expanded', 'false');
                parentLink.focus();
            }
        }
    }
});

// 데스크톱에서 포커스 잃으면 서브메뉴 닫기
document.addEventListener('focusout', function() {
    if (isMobile()) return;

    setTimeout(() => {
        const focusedElement = document.activeElement;

        // 포커스가 GNB 밖으로 나갔으면 모든 서브메뉴 닫기
        if (!focusedElement.closest('.gnb-menu')) {
            document.querySelectorAll('.gnb-menu-item.active').forEach(item => {
                item.classList.remove('active');
                const link = item.querySelector(':scope > a');
                if (link) link.setAttribute('aria-expanded', 'false');
            });
        }
    }, 10);
});

// 페이지 로드 시 활성화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setActivePage);
} else {
    setActivePage();
}

// 해시 변경 시 활성화 업데이트
window.addEventListener('hashchange', setActivePage);
(function () {
  function moveCustomGNBUnderBody() {
    // html 요소가 정상적으로 존재하는지 확인
    var htmlEl = document.documentElement;
    if (!htmlEl || htmlEl.tagName !== 'HTML') return;

    var gnb = document.getElementById('customGNB');
    if (!gnb) return;

    var body = document.body;
    if (!body) return;

    // 이미 body 바로 아래(첫 번째 자식)라면 종료
    if (gnb.parentNode === body && body.firstElementChild === gnb) return;

    // body 바로 아래(최상단)로 이동
    try {
      body.insertBefore(gnb, body.firstElementChild);
    } catch (e) {
      console.error('Failed to move GNB:', e);
    }
  }

  // DOM이 준비되면 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      moveCustomGNBUnderBody();

      // GNB를 찾지 못했을 때만 observer 생성
      var gnb = document.getElementById('customGNB');
      if (!gnb) {
        setupObserver();
      }
    }, { once: true });
  } else {
    moveCustomGNBUnderBody();

    // GNB를 찾지 못했을 때만 observer 생성
    var gnb = document.getElementById('customGNB');
    if (!gnb) {
      setupObserver();
    }
  }

  function setupObserver() {
    var timeoutId;
    var observer = new MutationObserver(function () {
      var gnb = document.getElementById('customGNB');
      if (gnb && document.body) {
        moveCustomGNBUnderBody();
        cleanup();
      }
    });

    function cleanup() {
      observer.disconnect();
      clearTimeout(timeoutId);
    }

    // 10초 후 자동 정리
    timeoutId = setTimeout(function() {
      cleanup();
    }, 10000);

    // body만 감시 (document.documentElement보다 범위 축소)
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();