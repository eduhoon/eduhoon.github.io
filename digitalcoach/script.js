/* --- 공통 사용 시작 --- */
/* 하나 찾기,엘리먼트 반환 */
const getEle=(e,t=document)=>t.querySelector(e)
/* 전체 찾기,엘리먼트 리스트 반환 */
const getEleAll=(e,t=document)=>t.querySelectorAll(e)
/* block-id 찾아서 반환 */
const getBlockID=(o,t=document)=>getEle(`div[data-block-id="${o}"]`,t)
/* block-id 리스트 입력,리스트 반환 */
const getBlockIDs=(l,t=document)=>l.map(i=>getBlockID(i,t))
/* 블럭 숨기기,리스트로 전달 */
const hideBlocks=b=>b.forEach(e=>setClass(e,'hide'))
/* 블럭 삭제,리스트로 전달 */
const removeBlocks=b=>b.forEach(e=>e.remove())
/* ID 지정 */
const setId=(e,id)=>e&&(e.id=id)
/* class 지정 */
const setClass=(e,c)=>e&&e.classList.add(c)
/* class 삭제 */
const removeClass=(e,c)=>e&&e.classList.remove(c)
/* class 값 체크해서 true,false 리턴 */
const checkClass=(e,c)=>!!e?.classList.contains(c)
/* html 속성 삭제 */
const removeAttr=(e,a)=>typeof a=="object"?a.forEach(v=>e.removeAttribute(v)):e.removeAttribute(a)
/* html style 프로퍼티 삭제 */
const removeStyle=(e,p)=>typeof p=="object"?p.forEach(v=>e.style.removeProperty(v)):e.style.removeProperty(p)
/* --- 공통 사용 끝 ---  */
/* 헤더 */
const pageTitle=getEle('.page-title>span');
const header=pageTitle.closest('.notion-scroller >div');
setId(header,'header');
const h1button=document.querySelectorAll('.notion-topbar div[role="button"]')[0]
removeAttr(h1button,'role');
removeAttr(h1button,'tabindex');
/* 메뉴 */
const gnb=getBlockID('4fc560f0-73ce-4443-9863-82c9dc36a2e2');
const topBarTitle=getEle('.notion-topbar >div >div:first-child');
if (!!gnb) setId(gnb.parentElement,'gnb');
/* 타이틀 */
let titleArr=[getEle('.notion-topbar div:first-child a >div >div'),pageTitle];
if (!pageTitle) titleArr=[getEle('.notion-topbar div:first-child a >div >div')];
titleArr.forEach(ele=>{
  const pageTitleSpanArea=ele.innerHTML.slice(7,12);
  ele.innerHTML=ele.innerHTML.replace(pageTitleSpanArea,`<span>${pageTitleSpanArea}</span>`);
});
/* 컨텐츠 */
const contBlock=getBlockID('eeaf78af-17d9-4767-b905-6008e76d14fc');
if (!!contBlock) {
  setId(contBlock.parentElement,'contents');
}
/* style color 제거 */
removeStyle(getEle('.notion-app-inner'),'color');
removeStyle(getEle('.notion-page-content'),'color');
if (!!gnb) {
  /* 메뉴 영역 변경 감지 삭제 */
  function gnbChange(tar) {
    let gnbHeight=0;
    tar.querySelectorAll('[role="button"]>div').forEach(tar=>{
      if (tar.style.marginLeft != '0px') {
        tar.closest('a').parentElement.remove();
      } else {
        gnbHeight += tar.closest('a').parentElement.offsetHeight;
      }
    });
    tar.parentElement.style.height=gnbHeight + 24 + 'px';
  };
  gnbChange(gnb);
  const gnbCallback=(mutationList,observer)=>{
    mutationList.forEach((ele,index)=>{ gnbChange(ele.target) })
  };
  const gnbObserver=new MutationObserver(gnbCallback);
  gnbObserver.observe(gnb,{ childList: true,subtree: true });
  const gnbTimer=setTimeout(()=>{
    gnbObserver.disconnect();
    console.log('gnb 감지 종료');
  },1000 * 50);
}
function elesWrap(arr,className,idName) {
  const eles=getBlockIDs(arr);
  const result=eles.reduce((count,data)=>data ? count + 1 : count,0);
  if (result == 0) return false;
  const newDiv=document.createElement('div');
  if (idName) {
    setId(newDiv,idName);
  }
  if (className) {
    setClass(newDiv,className);
  }
  eles.forEach(ele=>{
    if (ele) {
      // delete ele.dataset.blockId;
      newDiv.append(ele);
    }
  });
  return newDiv;
};
function elesRangeWrap(start,end,className,idName) {
  const arr=[];
  let next=getBlockID(start);
  if (!next) return false;
  while (next.dataset.blockId != end) {
    if (!next.dataset.blockId) break;
    arr.push(next.dataset.blockId);
    next=next.nextSibling;
  }
  return elesWrap(arr,className,idName);
}
if (!!contBlock) {
  /* 콘텐츠 영역 변경 감지*/
  function contChange(ele) {
    const contTar=!ele.type ? ele : ele.target;
    const contOrigin=!ele.type ? null : ele;
    if (contTar.dataset.blockId == 'eeaf78af-17d9-4767-b905-6008e76d14fc') {
      // 수학공식블록 정리
      getEleAll('.katex-display',contTar).forEach(ele=>{
        const tar=ele.closest('[role]');
        if (!!tar) {
          removeAttr(tar,['role','tabindex']);
          removeStyle(tar,['cursor','user-select','transition']);
        }
      });
      // 갤러리뷰인 경우 class 추가
      getEleAll('.notion-gallery-view',contTar).forEach(ele=>{
        if (!checkClass(ele.parentElement,'notion_gallery_view')) {
          setClass(ele.parentElement,'notion_gallery_view');
        }
      });
      // 기관,학교,나이 부분 div로 감싸고 class 추가하기
      const listNumbers=[
        'c8972797-7ed4-4c95-a765-192fadaea4de',
        'b4c0ccb1-2ebc-452e-b1a8-9905111cea76',
        'ba7284c9-074b-4f92-a76f-5c9dbd15f97d',
        '7056e7a0-7767-4b0a-bf76-6d43c79bcba3'
      ];
      const numberDiv=elesWrap(listNumbers,'cus_numbers');
      if (numberDiv) {
        const profile=getBlockID('28516376-8d55-4d87-a481-1e783f2849f1');
        profile.after(numberDiv);
      };
      // 제목 엘리먼트 이전 체크
      if (getEleAll('.prev_page_title',contTar).length == 0) {
        getEleAll('.notion-header-block',contTar).forEach(ele=>{
          if (!!ele.previousElementSibling) setClass(ele.previousElementSibling,'prev_page_title');
        });
      }
    }
    // 갤러리뷰
    if (contTar.closest('.notion-gallery-view')) {
      const gallTar=contTar.closest('a[style] >div');
      if (!checkClass(gallTar,'inner_gallery')) setClass(gallTar,'inner_gallery');
    }
    // 삭제
    if (getEleAll('.pageEmpty',contTar).length > 0) getEleAll('.pageEmpty',contTar).forEach(ele=>ele.parentElement.remove());
    if (getEleAll('div[data-block-id="059a3818-8bc9-4417-9805-3b73ece4fa11"]',contTar).length > 0) {
      getEleAll('div[data-block-id="059a3818-8bc9-4417-9805-3b73ece4fa11"]',contTar).forEach(ele=>{
        const pEl=ele.parentElement;
        if (pEl.hasAttribute('contenteditable')) pEl.remove()
      });
    }
  };
  contChange(contBlock);
  const contCallback=(mutationList,observer)=>{
    mutationList.forEach((ele,index)=>{ contChange(ele) })
  };
  const contObserver=new MutationObserver(contCallback);
  contObserver.observe(contBlock,{ childList: true,subtree: true });
}
/* 게시판 */
getEleAll('.notion-list-view .notion-collection_view-block').forEach(ele=>{
  ele.querySelectorAll('a').forEach(l=>(l.role='none',l.tabIndex=-1))
  ele.querySelectorAll('div[tabindex]').forEach(d=>removeAttr(d,'tabindex'))
});
getEleAll('div[role="tablist"] div[role="button"]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const container=btn.closest('.notion-collection_view-block')
    if(!container) return
    let changed=false, quietTimer
    const OBS_QUIET_MS=1000     // 마지막 변화 후 이 시간 지나면 완료로 간주
    const NOCHANGE_TIMEOUT=1000// 이 시간 안에 변화 없으면 포기
    const o=new MutationObserver(muts=>{
      for(const m of muts){
        const blk=(m.target.nodeType===1?m.target: m.target.parentElement)?.closest('.notion-collection_view-block')
        if(blk && container.contains(blk)){ changed=true; break }
      }
      if(changed){
        clearTimeout(quietTimer)
        quietTimer=setTimeout(done,OBS_QUIET_MS)
      }
    })
    const done=()=>{
      o.disconnect()
      if(!changed) return
      // ✅ 로딩 종료 후 실행할 코드
      container.querySelectorAll('.notion-collection_view-block').forEach(ele=>{
        ele.querySelectorAll('a').forEach(l=>(l.role='none',l.tabIndex=-1));
        ele.querySelectorAll('div[tabindex]').forEach(d=>removeAttr(d,'tabindex'))
      })
    }
    o.observe(container,{childList:true,subtree:true,characterData:true})
    setTimeout(()=>{ if(!changed){ o.disconnect() } }, NOCHANGE_TIMEOUT)
  })
})
/* 모바일 스크롤 */
let menuTop=header.clientHeight + 7;
const scrollFn=()=>{
  if (!!gnb) {
    const gnbTar=getEle('#gnb');
    if (menuTop < gnbTar.offsetTop) {
      if (!checkClass(gnbTar,'menu_shadow')) setClass(gnbTar,'menu_shadow');
      removeClass(topBarTitle,'left_out');
    } else {
      gnbTar.classList.remove('menu_shadow');
      if (!checkClass(topBarTitle,'left_out')) setClass(topBarTitle,'left_out');
    }
  }
}
window.addEventListener('load',()=>{ menuTop=header.clientHeight + 7; scrollFn() });
window.addEventListener('scroll',scrollFn);
window.addEventListener('resize',()=>{ menuTop=header.clientHeight + 7; scrollFn() });
window.addEventListener('click',event=>{
  const tar=event.target;
})